<h1 align="center">
  <img alt="GoBarber" title="GoBarber" src="https://i.ibb.co/pLRqqMT/fastfeet.png" width="100px" />
</h1>

<h3 align="center">
  Backend FastFeet
</h3>

<p>
Esta é a aplicação do desafio final do bootcamp GoStack da [Rocketseat](https://rocketseat.com.br/), onde desenvolveremos uma aplicação COMPLETA - Backend / Front end Web / Front end Mobile. Além de ser avaliada para receber a emissão do certificado.
</p>

<blockquote align="center">“Sempre passar o que você aprendeu. - Mestre Yoda”</blockquote>

<p align="center">
  <a href="#rocket-sobre-a=aplicacao">Sobre a aplicação</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-funcionalides">Funcionalidades</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-exemplo">Exemplo</a>
</p>

## :rocket: Sobre a aplicação

A aplicação FastFeet é uma aplicação para a gestão da transportadora. Apenas o Admin tem o controle de destinatários, entregadores e entregas. O entregador utiliza seu ID para cadastrar problemas (caso haja) e retirar / finalizar suas entregas.

### **Funcionalidades**

Aplicação foi criada utilizando [Express](https://expressjs.com/), além utilizar as seguintes ferramentas:

- Sucrase + Nodemon;
- ESLint + Prettier + EditorConfig;
- Sequelize (PostgreSQL);
- Filas com Redis e Bee Queue
- Emails com NodeMailer
- Lib datefns para o controle de horários

### **Exemplo**
`Método de Agendamento: `
```js
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
```
- Podemos notar várias verificações. Esse método tem a função de retirar as entregas, várias verificações são feitas, utilizando o [Yup](https://github.com/jquense/yup) e para a verificação de alguns dados o [date-fns](https://date-fns.org/) para a verificação das datas

---
Feito com ♥ by araujooj :wave:
