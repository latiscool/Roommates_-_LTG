const axios = require('axios');
const fs = require('fs');
const { send } = require('./mailer');
const { v4: uuidv4 } = require('uuid');

//CREANDDO NUEVO ROOMMATE
const newRoommate = async (debe, recibe) => {
  try {
    //Obteniendo el modelo de datos, un objeto con un arreglo de objetos
    const { data } = await axios.get('https://randomuser.me/api');
    //Mapeando la primera y unica posicion del arreglo de objeto [0]
    const nom = data.results[0];
    const nomUsr = nom.name;
    const roommates = {
      // id: uuidv4().slice(30),
      nombre: `${nomUsr.title} ${nomUsr.first} ${nomUsr.last}`,
      correo: nom.email,
      debe: 0,
      recibe: 0,
      total: 0,
    };
    return roommates;
  } catch (e) {
    throw e;
  }
};
//GUARDANDO EL NUEWVO ROOMATE
const saveRoommate = (roommates) => {
  //utilizar el contendio del usuario.json se convierte a objeto json
  const roommateJSON = JSON.parse(fs.readFileSync('roommates.json', 'utf-8'));
  //accediendo a la propiedad roommate del objeto del archivo roommate.json y llenamos con push
  roommateJSON.roommates.push(roommates);
  //sobre escribiendo .json el cual adquiere los nuevo roommates
  fs.writeFileSync('roommates.json', JSON.stringify(roommateJSON));
};

// Funcion gastosRoommate() de la peticion POST /gasto
const emailRoommates = (g) => {
  const emailJson = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
  const emailGastos = emailJson.gastos;
  const emailRommys = JSON.parse(fs.readFileSync('roommates.json', 'UTF8'));
  const roommatesCount = emailRommys.roommates;

  if (roommatesCount.length > 0) {
    emailGastos.push(g);
    gastosRoommates(emailGastos);
    fs.writeFileSync('gastos.json', JSON.stringify(emailJson));
    // 06 Enviar un correo electronico a todos los roommates cuando se registre un nuevo cambio
    console.log(g.roommate, g.descripcion, g.monto, g.correo.split(','));
    send(g.roommate, g.descripcion, g.monto, g.correo.split(','))
      .then(() => {
        console.log('Envío de correo exitoso');
      })
      .catch((error) => {
        res.statusCode = 500;
        res.end();
        console.log('Error error en el envio del correo', error);
      });
  } else {
    console.log('No se han agregado roommates');
  }
};

const gastosRoommates = (data) => {
  const roommateJSON = JSON.parse(fs.readFileSync('roommates.json', 'UTF8'));
  let roommates = roommateJSON.roommates;

  roommates.map((r) => {
    r.debe = 0;
    r.recibe = 0;
    r.total = 0;
    return r;
  });

  data.forEach((ele) => {
    const repartoGastos = Number(ele.monto / roommates.length).toFixed(2);
    roommates = roommates.map((params) => {
      if (ele.roommate == params.nombre) {
        params.recibe += parseFloat(repartoGastos);
      } else {
        params.debe -= parseFloat(repartoGastos);
      }
      params.total = parseFloat((params.recibe + params.debe).toFixed(2));
      return params;
    });
  });

  fs.writeFileSync('roommates.json', JSON.stringify(roommateJSON));
  return data;
};

module.exports = { newRoommate, saveRoommate, emailRoommates };
