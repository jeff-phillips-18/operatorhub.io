const axios = require('axios');
const _ = require('lodash');
const jsBase64 = require('js-base64');
const yaml = require('js-yaml');
const operatorUtils = require('../utils/operatorUtils');
const persistentStore = require('../store/persistentStore');

const { Base64 } = jsBase64;
const gitHubURL = 'https://api.github.com';
const operatorsRepoOwner = `operator-framework`;
const operatorsRepoProject = `community-operators`;
const operatorsRepo = `${operatorsRepoOwner}/${operatorsRepoProject}`;
const operatorsDirectory = `community-operators`;
const operatorFileQuery = `*.clusterserviceversion.yaml`;

const allOperatorsRequest = `${gitHubURL}/search/code?q=repo:${operatorsRepo}+path:${operatorsDirectory}+filename:${operatorFileQuery}`;
const operatorContentsURL = `${gitHubURL}/repos/${operatorsRepo}/contents`;

const fetchOperator = (serverRequest, serverResponse) => {
  persistentStore.getOperator(serverRequest.query.name, operators => {
    serverResponse.send({ operators });
  });
};

const fetchOperators = (serverRequest, serverResponse) => {
  persistentStore.getOperators(operators => {
    serverResponse.send({ operators });
  });
};

const retrieveOperators = callback => {
  axios
    .get(allOperatorsRequest)
    .then(response => {
      const operatorFiles = response.data.items;
      const operatorRequests = [];

      _.forEach(operatorFiles, operatorFile => {
        operatorRequests.push(axios.get(`${operatorContentsURL}/${operatorFile.path}`));
      });

      return axios
        .all(operatorRequests)
        .then(({ ...allResults }) => {
          const operators = [];
          _.forEach(allResults, operatorResult => {
            try {
              const operator = yaml.safeLoad(Base64.decode(operatorResult.data.content));
              operators.push(operator);
            } catch (e) {
              console.log(`Error Parsing ${_.get(operatorResult, 'data.name', 'Unknown Operator')}`);
              console.dir(e);
            }
          });
          const ops = operatorUtils.normalizeOperators(operators);
          persistentStore.setOperators(ops, err => {
            callback(err);
          });
        })
        .catch(error => {
          callback(error);
        });
    })
    .catch(error => {
      callback(error);
    });
};

const operatorsService = {
  fetchOperators,
  fetchOperator,
  retrieveOperators
};
module.exports = operatorsService;
