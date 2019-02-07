import axios from 'axios';
import * as _ from 'lodash-es';
import * as versionSort from 'version-sort';
import { helpers } from '../common/helpers';
import { reduxConstants } from '../redux';
import { mockOperators } from '../__mock__/operators';

const allOperatorsRequest = process.env.DEV_MODE ? `http://localhost:9065/api/operators` : `/api/operators`;
const operatorRequest = process.env.DEV_MODE ? `http://localhost:9065/api/operator` : `/api/operator`;

const addVersionedOperator = (operators, newOperator) => {
  const existingOperator = _.find(operators, { name: newOperator.name });
  if (existingOperator) {
    if (!existingOperator.versions) {
      existingOperator.versions = [existingOperator];
    }
    existingOperator.versions.push(newOperator);
  }
  return !!existingOperator;
};

const getVersionedOperators = operators => {
  const uniqueOperators = _.reduce(
    operators,
    (versionedOperators, operator) => {
      if (!addVersionedOperator(versionedOperators, operator)) {
        versionedOperators.push(operator);
      }
      return versionedOperators;
    },
    []
  );

  return _.map(uniqueOperators, operator => {
    if (!operator.versions) {
      return operator;
    }

    const sortedOperators = versionSort(operator.versions, { nested: 'versionForCompare' });
    const latestOperator = sortedOperators[sortedOperators.length - 1];
    latestOperator.version = `${latestOperator.version} (latest)`;

    operator.versions = sortedOperators;
    _.forEach(operator.versions, nextVersion => {
      nextVersion.versions = sortedOperators;
    });

    return latestOperator;
  });
};

const fetchOperator = operatorName => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  if (process.env.MOCK_MODE) {
    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
      payload: getVersionedOperators(_.cloneDeep(_.filter(mockOperators, { name: operatorName })))
    });
    return;
  }

  const config = { params: { name: operatorName } };
  axios.get(operatorRequest, config).then(response => {
    const responseOperators = response.data.operators;
    const operators = getVersionedOperators(responseOperators);
    console.dir(operators);

    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATOR),
      payload: operators[0]
    });
  });
};

const fetchOperators = () => dispatch => {
  dispatch({
    type: helpers.PENDING_ACTION(reduxConstants.GET_OPERATORS)
  });

  if (process.env.MOCK_MODE) {
    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
      payload: getVersionedOperators(_.cloneDeep(mockOperators))
    });
    return;
  }

  axios.get(allOperatorsRequest).then(response => {
    const responseOperators = response.data.operators;
    const operators = getVersionedOperators(responseOperators);

    dispatch({
      type: helpers.FULFILLED_ACTION(reduxConstants.GET_OPERATORS),
      payload: operators
    });
  });
};

const operatorsService = {
  fetchOperator,
  fetchOperators
};

export { operatorsService, fetchOperator, fetchOperators };
