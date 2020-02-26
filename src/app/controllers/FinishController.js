import * as Yup from 'yup';

import Delivery from '../models/Delivery';

class FinishController {
  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const { id, deliveryId } = req.params;
    const { signature_id } = req.body;

    const delivery = await Delivery.findOne({
      where: {
        id: deliveryId,
        deliveryman_id: id,
        canceled_at: null,
      },
    });
    // Check delivery exists
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery not found.' });
    }

    // Checks whether the order has been withdrawn for delivery
    if (!delivery.start_date) {
      return res.status(401).json({ error: 'Withdrawal the order first!' });
    }

    if (delivery.end_date) {
      return res.status(401).json({ error: 'Already delivered' });
    }

    await delivery.update({
      signature_id,
      end_date: new Date(),
    });

    return res.json({
      message: 'Finished the delivery with success',
    });
  }
}

export default new FinishController();
