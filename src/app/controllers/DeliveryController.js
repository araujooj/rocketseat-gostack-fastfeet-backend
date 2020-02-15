import * as Yup from 'yup';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

import Queue from '../../lib/Queue';
import DeliveryMail from '../jobs/DeliveryMail';

class DeliveryController {
  async index(req, res) {
    const orders = await Delivery.findAll({
      where: { canceled_at: null },
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'signature_id',
      ],
      include: [
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['name', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'number',
            'complement',
            'state',
            'city',
            'cep',
          ],
        },
      ],
      order: ['id'],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      deliveryman_id: Yup.number().required(),
      recipient_id: Yup.number().required(),
      product: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }
    const { deliveryman_id, recipient_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id, {
      attributes: [
        'name',
        'street',
        'number',
        'complement',
        'state',
        'city',
        'cep',
      ],
    });
    const deliveryman = await DeliveryMan.findByPk(deliveryman_id, {
      attributes: [
        'name',
        'email',
      ],
    });

    if (!recipient || !deliveryman) {
      return res.status(404).json({
        error: 'Not found recipient or deliveryman',
      });
    }
    const deliveryExists = await Delivery.findOne({
      where: {
        recipient_id,
        deliveryman_id,
      },
    });

    if (deliveryExists) {
      return res.status(401).json({ error: 'Order already exists.' });
    }

    const delivery = await Delivery.create({
      deliveryman_id,
      recipient_id,
      product,
    });

    await Queue.add(DeliveryMail.key, {
      recipient, deliveryman, delivery,
    });

    return res.json(delivery);
  }
}

export default new DeliveryController();
