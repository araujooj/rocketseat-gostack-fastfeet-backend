import { Op } from 'sequelize';
import {
  setHours,
  setSeconds,
  setMinutes,
  startOfHour,
  format,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';

import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

import hours from '../../constants/hours';

class PackageController {
  async index(req, res) {
    /**
     * Orders to delivery
     */
    const { id } = req.params;
    const delivery = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: null,
        signature_id: null,
      },
      attributes: ['id', 'product', 'start_date', 'canceled_at'],
      include: [
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
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
    /**
     * Orders delivered
     */
    const { id } = req.params;
    const delivery = await Delivery.findAll({
      where: {
        deliveryman_id: id,
        canceled_at: null,
        end_date: {
          [Op.ne]: null,
        },
      },
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

  async update(req, res) {
    const { id, deliveryId } = req.params;

    /**
     * Check if hour is available to withdraw = Between 08:00 - 18:00
     */
    const available = hours.map((index) => {
      const [hour, minute] = index.split(':');

      const availableValue = setSeconds(
        setMinutes(setHours(new Date(), hour), minute),
        0,
      );

      return {
        value: format(availableValue, "yyyy-MM-dd'T'HH:mm:ssxxx"),
      };
    });

    const start_date = {
      value: format(startOfHour(new Date()), "yyyy-MM-dd'T'HH:mm:ssxxx"),
    };

    const withdrawnAvailable = available.find(
      (h) => h.value === start_date.value,
    );

    if (!withdrawnAvailable) {
      return res.status(401).json({
        error: 'You cannot withdraw outside of business hour',
      });
    }
    /**
     * Check if delivery man already did 5 withdraws
     */
    const deliveries = await Delivery.findAll({
      where: {
        start_date: {
          [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
        },
        deliveryman_id: id,
      },
    });

    if (deliveries.length >= 5) {
      return res
        .status(401)
        .json({ error: 'You can withdraw only 5 deliveries per day' });
    }

    const delivery = await Delivery.findOne({
      where: {
        id: deliveryId,
        deliveryman_id: id,
      },
    });
    // Check if order has already left for delivery.
    const inDelivery = await Delivery.findOne({
      where: {
        id: deliveryId,
        deliveryman_id: id,
        start_date: {
          [Op.ne]: null,
        },
      },
    });

    if (inDelivery) {
      return res
        .status(401)
        .json({ error: 'The order has already left for delivery' });
    }

    // Check if delivery exists.
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found.' });
    }

    await delivery.update({
      start_date: parseISO(start_date.value),
    });
    return res.json({ message: 'Delivery withdrawn!' });
  }
}

export default new PackageController();
