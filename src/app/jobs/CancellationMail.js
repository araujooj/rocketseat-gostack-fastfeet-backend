import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail'; // Chave única
  }

  async handle({ data }) {
    const { deliveryman, delivery, recipient } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Uma entrega foi cancelada!',
      template: 'cancellation',
      context: {
        deliveryman: deliveryman.name,
        recipient: recipient.name,
        address: `CEP - ${recipient.cep}, 
        ${recipient.street}, N° ${recipient.number}, ${recipient.city}- ${recipient.state}`,
        product: delivery.product,
      },
    });
  }
}

export default new CancellationMail();
