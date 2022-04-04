const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PWD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('Ha ocurrido una falla: ' + error);
  } else {
    console.log(' El servidor esta listo para recibir nuestros mensajes');
  }
});

const send = async (roommate, descripcion, monto, correo) => {
  let mailOptions = {
    from: process.env.EMAIL_USER,
    to: [process.env.EMAIL_USER].concat(correo),
    subject: `El usuario(a) ${roommate} se agrego al historial de gastos`,
    html: ` <h3>Aviso: Se informa que el usuario(a) ${roommate} ha realizado un gasto de  ${descripcion} por un monto de $${monto}.</h3>`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = { send };
