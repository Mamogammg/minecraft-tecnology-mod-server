const http = require('http');
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

// Configurar middleware para analizar solicitudes JSON
app.use(bodyParser.json());

// Datos iniciales (esto es solo un ejemplo)
var data = {}
var sended = false

function random(digits) {
  var list = ["1","2","3","4","5","6","7","8","9","0","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"]
  var code = ""
  for (let i=0;i<digits;i++) {
    code = code + list[Math.floor(Math.random()*36)]
  }
  return code;
} 

const server = http.createServer((req, res) => {
  // Manejar la solicitud de la raíz ("/")
  if (req.url === '/' || req.url === '' || req.url.includes('/?')) {
    if (req.method === 'POST') {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        console.log(req.headers)
        //body = JSON.parse(body)
        if (req.headers["subject"] == "set") {
          code = random(6)
          console.log(code)
          data[code] = ["",req.headers["card"]]
          res.end(code)
        } else if (req.headers["subject"] == "get") {
          var send = "false"
          Object.getOwnPropertyNames(data).forEach(function (val, idx, array) {
            if (data[val][0] == req.headers["name"]) {
              send = data[val][1]
              if (sended) {
                sended = false
                delete data[val]
              } else {
                sended = true
              }
            } 
          });
          res.end(send)
        }
      })
    } else if (req.method === 'PUT') {
      let body = '';

      req.on('data', chunk => {
        body += chunk;
      });

      req.on('end', () => {
        body = JSON.parse(body)
        console.log(body)
        if (data[body.data.code][0] == "") {
          data[body.data.code][0] = body.data.name
        }
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(JSON.stringify(data))
      })
    } else if (req.method === 'GET') {
      const indexPath = path.join(__dirname, 'index.html');

      // Leer el archivo "index.html" de manera asíncrona
      fs.readFile(indexPath, 'utf8', (err, content) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error interno del servidor');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        }
      });
    }
  } else {
    // Enviar una respuesta 404 para cualquier otra solicitud
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Página no encontrada');
  }
});

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}/`);
});
