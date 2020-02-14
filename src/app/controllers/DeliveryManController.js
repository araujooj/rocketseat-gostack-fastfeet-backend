import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';

class DeliveryManController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      avatar_id: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const userExists = await DeliveryMan.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const {
      id,
      name,
      email,
      avatar_id,
    } = await DeliveryMan.create(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async index(req, res) {
    const couriers = await DeliveryMan.findAll({
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [{
        model: File,
        as: 'avatar',
        attributes: ['name', 'path', 'url'],
      }],
      order: ['id'],
    });
    if (!couriers) {
      return res.status(404).json({ error: 'Not found any couriers' });
    }

    return res.json(couriers);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      avatar_id: Yup.number(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const couriers = await DeliveryMan.findByPk(id);

    if (!couriers) {
      return res.json({
        error: 'Delivery Man not found',
      });
    }

    const {
      name,
      email,
      avatar_id,
    } = await couriers.update(req.body);

    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await DeliveryMan.findByPk(id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Delivery Man not found.' });
    }

    await deliveryman.destroy();

    return res.json({ msg: 'Successful deleted.' });
  }
}

export default new DeliveryManController();
