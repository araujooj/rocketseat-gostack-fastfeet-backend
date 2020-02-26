import * as Yup from 'yup';

import CancellationMail from '../jobs/CancellationMail';
import DeliveryProblem from '../models/DeliveryProblem';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import DeliveryMan from '../models/DeliveryMan';
import Queue from '../../lib/Queue';

class DeliveryProblemsController {
  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const { delivery_id } = req.params;
    const { description } = req.body;

    const delivery = await Delivery.findByPk(delivery_id);

    if (!delivery) {
      return res.status(404).json({
        error: 'Not found delivery',
      });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id,
      description,
    });

    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    /**
     * Cancel delivery, function for the admin
     */
    const { id } = req.params;

    const delivery = await Delivery.findByPk(id, {
      include: [
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'cep'],
        },
      ],
    });

    if (!delivery) {
      return res.status(401).json({
        error: 'Error on cancel the delivery',
      });
    }
    if (delivery.canceled_at) {
      return res
        .status(401)
        .json({ error: 'Delivery has already been canceled.' });
    }
    delivery.canceled_at = new Date();

    const recipient = await Recipient.findByPk(delivery.recipient_id, {
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
    const deliveryman = await DeliveryMan.findByPk(delivery.deliveryman_id, {
      attributes: ['name', 'email'],
    });

    await delivery.save();
    await Queue.add(CancellationMail.key, {
      recipient,
      deliveryman,
      delivery,
    });

    return res.json({
      message: 'Delivey canceled successfully',
    });
  }
}

export default new DeliveryProblemsController();
