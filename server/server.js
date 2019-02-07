const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const forceSSL = require('express-force-ssl');
const _ = require('lodash');

const operatorsService = require('./services/operatorsService');
const persistentStore = require('./store/persistentStore');
const routes = require('./routes/routes');
const mockOperators = require('./__mock__/operators');

const mockMode = false;
const keysDirectory = './keys';

const app = express();

const setupApp = () => {
  app.set('port', process.env.PORT || 9065);
  app.set('secureport', process.env.SECUREPORT || 9443);

  app.use(express.static('../frontend/dist'));

  // routes
  routes(app);
};

const serverStart = err => {
  if (err) {
    console.error(`Error loading operators: ${_.get(err, 'response.data.message', err)}`);
  }
  server.listen(app.get('port'), () => {
    console.log(`Express server listening on port ${app.get('port')}`);
  });

  // secureServer.listen(app.get('secureport'), () => {
  //   console.log(`Express secure server listening on port ${app.get('secureport')}`);
  // });
};

setupApp();

// const secureOptions = {
//   key: fs.readFileSync(`${keysDirectory}/operator-hub-key.pem`),
//   cert: fs.readFileSync(`${keysDirectory}/operator-hub-cert.pem`)
// };

// Create HTTP server and listen on port 8000 for requests
// const secureServer = https.createServer(secureOptions, app);
const server = http.createServer(app);

// app.use(forceSSL);

const populateDBMock = () => {
  persistentStore.setOperators(mockOperators);
  serverStart();
};

const populateDB = () => {
  operatorsService.retrieveOperators(serverStart);
};

const populate = mockMode ? populateDBMock : populateDB;

persistentStore.initialize(populate);
