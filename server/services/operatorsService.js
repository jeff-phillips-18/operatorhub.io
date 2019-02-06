const axios = require('axios');
const _ = require('lodash');
const yaml = require('js-yaml');
const persistentStore = require('../store/persistentStore');

const getErrorResponse = error => ({
  err: true,
  message: error.response.data.message
});

const fetchOperator = (serverRequest, serverResponse) => {
  const operatorName = serverRequest.query.name;
  serverResponse.send(persistentStore.getOperator(operatorName))
}

const fetchOperators = (serverRequest, serverResponse) => {
  persistentStore.getOperators(serverResponse.send());
}

const operatorsService = {
  fetchOperators,
  fetchOperator
};
module.exports = operatorsService;
