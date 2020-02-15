import Mail from '../../lib/Mail';

class DeliveryMail {
  get key() {
    return 'DeliveryMail'; // Chave única
  }

  async handle({ data }) {
    const { deliveryman, recipient, delivery } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Nova entrega designada para você!',
      template: 'delivery',
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

export default new DeliveryMail();
