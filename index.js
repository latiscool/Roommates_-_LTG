const http = require('http');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const url = require('url');
const PORT = 3000;
const host = 'localhost';
let today = new Date();
const { newRoommate, saveRoommate, emailRoommates } = require('./roommate');

const requestListener = (req, res) => {
  //RUTA RAIZ - GET
  // **************************************************************
  // **************************************************************
  if (req.url == '/' && req.method == 'GET') {
    res.setHeader('content-type', 'text/html');
    res.end(fs.readFileSync('index.html', 'utf8'));
  }
  //RUTA ROOMMATE - POST (Creamos el nommbre del roommate en el archivo roommate.js)
  // **************************************************************
  // **************************************************************
  // Esta ruta ejecuta una funcion que emita instruccion
  //Para hacer  una consulta asincrona a traves de axios en la api random.user
  //Por lo cual, pasamos a programacion modular (roommate.js)
  if (req.url.startsWith('/roommate') && req.method == 'POST') {
    newRoommate()
      .then(async (roommates) => {
        saveRoommate(roommates);
        res.end(JSON.stringify(roommates));
        console.log(
          'El Roommate fue agregado con exito ' +
            JSON.stringify(roommates.nombre)
        );
      })
      .catch((e) => {
        res.statusCode = 500;
        res.end();
        console.log('Error en el registro de un roommate random', e);
      });
  }

  // **********************************************************
  // ***Se necesitan los dos metodos GET de roommate y gasto
  // Debido a que en la funcion imprimir en el html depende de estas dos
  // *************************************************************
  // const imprimir = async () => {
  //     await getRoommates();
  //     await getGastos();
  // .....
  // ....
  // ..
  // }

  //RUTA ROOMMATES- GET (Para visualizar el nombre del roomate en html)
  if (req.url.startsWith('/roommates') && req.method == 'GET') {
    res.setHeader('content-type', 'application/json');
    res.end(fs.readFileSync('roommates.json', 'utf-8'));
  }
  //RUTA GASTOS - GET
  if (req.url.startsWith('/gastos') && req.method == 'GET') {
    res.setHeader('content-type', 'application/json');
    res.end(fs.readFileSync('gastos.json', 'utf8'));
  }

  // RUTA GASTO - POST
  //  // Esta recibiendo un payload, conjunto de datos
  //  proveniente del formulario  de "Agregar Gasto"
  if (req.url.startsWith('/gasto') && req.method == 'POST') {
    const roommateJSON = JSON.parse(fs.readFileSync('roommates.json', 'UTF8'));
    let mail = roommateJSON.roommates.map((c) => c.correo).toString();

    let body;

    let form;
    req.on('data', (payload) => {
      body = JSON.parse(payload);
      // console.log('body print', body);
    });

    req.on('end', () => {
      form = {
        id: uuidv4().slice(30),
        roommate: body.roommate,
        correo: mail,
        descripcion: body.descripcion,
        monto: body.monto,
        fecha: today,
      };

      emailRoommates(form);
      res.statusCode = 200;
      console.log(`Se ha ingresado el gasto de "${form.roommate}"`);
      res.end();
    });
  }
  //RUTA GASTO - PUT

  if (req.url.startsWith('/gasto') && req.method == 'PUT') {
    let form;
    const { id } = url.parse(req.url, true).query;

    req.on('data', (payload) => {
      form = JSON.parse(payload);
      roomy = form.roommate;
      form.id = id;
    });
    req.on('end', () => {
      //Para poder filtrar la id en gastos.json se parsea para trabajarlo como objeto js
      const updateJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
      const gastos = updateJSON.gastos.map((gasto) => {
        //Condicional si encuentra id que estamos modificando, proceda con el PUT
        if (gasto.id == form.id) {
          return form;
        }
        return gasto;
      });
      //Volvemoa a parear a obj json el objeto gastos
      fs.writeFileSync('gastos.json', JSON.stringify({ gastos }));
      res.statusCode = 200;

      console.log(`Se ha editado el gasto de "${roomy}"`);
      res.end();
    });
  }

  //RUTA GASTO - DELETE
  if (req.url.startsWith('/gasto') && req.method == 'DELETE') {
    const { id } = url.parse(req.url, true).query;

    const removeJSON = JSON.parse(fs.readFileSync('gastos.json', 'utf8'));
    const gastos = removeJSON.gastos.filter((gasto) => gasto.id !== id);

    fs.writeFileSync('gastos.json', JSON.stringify({ gastos }));

    res.statusCode = 200;
    console.log('Se ha eliminado un gasto');
    res.end();
  }
};

const server = http.createServer(requestListener);

server.listen(PORT, host, () => {
  console.log('Servidor se esta ejecutando');
});
