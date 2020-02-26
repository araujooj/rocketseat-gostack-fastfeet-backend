import * as Yup from 'yup';
import { startOfHour, isBefore, parseISO } from 'date-fns';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

import Queue from '../../lib/Queue';
import DeliveryMail from '../jobs/DeliveryMail';


/**
 * This controller is only for admins - Only authenticated users can use this features!
 */

class DeliveryController {
  async index(req, res) {
    const delivery = await Delivery.findAll({
      where: { canceled_at: null, end_date: null },
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
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

    return res.json(delivery);
  }

  async show(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id, {
      where: { canceled_at: null, end_date: null },
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
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

    if (!delivery) {
      return res.json({
        error: 'Delivery not found',
      });
    }

    return res.json(delivery);
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
      attributes: ['name', 'email'],
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
        canceled_at: null,
        start_date: null,
        end_date: null,
        signature_id: null,
      },
    });

    if (deliveryExists) {
      return res.status(401).json({ error: 'Delivery already exists.' });
    }

    const delivery = await Delivery.create({
      deliveryman_id,
      recipient_id,
      product,
    });

    await Queue.add(DeliveryMail.key, {
      recipient,
      deliveryman,
      delivery,
    });

    return res.json(delivery);
  }

  async update(req, res) {
    /**
     * update delivery, function for the admin
     */
    const schema = Yup.object().shape({
      id: Yup.number(),
      deliveryman_id: Yup.number(),
      recipient_id: Yup.number(),
      signature_id: Yup.number(),
      product: Yup.string(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const { start_date, end_date } = req.body;

    const hourStart = startOfHour(parseISO(start_date));
    const hourEnd = startOfHour(parseISO(end_date));

    /* Check for past dates */
    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permitted',
      });
    }

    if (isBefore(hourEnd, new Date())) {
      return res.status(400).json({
        error: 'Past dates are not permitted',
      });
    }
    const delivery = await Delivery.findByPk(id);

    if (!delivery) {
      return res.json({
        error: 'Delivery not found',
      });
    }

    const {
      deliveryman_id,
      recipient_id,
      signature_id,
      product,
    } = await delivery.update(req.body);

    return res.json({
      id,
      deliveryman_id,
      recipient_id,
      signature_id,
      product,
      start_date,
      end_date,
    });
  }
}

export default new DeliveryController();
