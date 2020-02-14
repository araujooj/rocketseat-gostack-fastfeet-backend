import * as Yup from 'yup';
import Recipient from '../models/Recipient';

class RecipientController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      street: Yup.string().required(),
      number: Yup.number().required(),
      state: Yup.string().required(),
      city: Yup.string().required(),
      cep: Yup.string().required(),
      complement: Yup.string(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }
    const {
      id,
      name,
      street,
      number,
      state,
      city,
      cep,
      complement,
    } = await Recipient.create(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      state,
      city,
      cep,
      complement,
    });
  }

  async index(req, res) {
    const recipients = await Recipient.findAll();
    if (!recipients) {
      return res.json({
        error: 'Not found any recipients',
      });
    }
    return res.json(recipients);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      state: Yup.string(),
      city: Yup.string(),
      cep: Yup.string(),
      complement: Yup.string(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(401).json({ error: 'Validation failed' });
    }

    const { id } = req.params;
    const recipients = await Recipient.findByPk(id);

    if (!recipients) {
      return res.json({
        error: 'Recipient not found',
      });
    }

    const {
      name,
      street,
      number,
      state,
      city,
      cep,
      complement,
    } = await recipients.update(req.body);

    return res.json({
      id,
      name,
      street,
      number,
      state,
      city,
      cep,
      complement,
    });
  }
}

export default new RecipientController();
