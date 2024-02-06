import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';
import { getPatient } from './patients';

const TYPE = 'outreach';

const fxOutreach = {
  id: '11111',
  phone_end: '1234',
};

Cypress.Commands.add('routeOutreachStatus', (mutator = _.identity) => {
  const data = getResource(fxOutreach, TYPE, {
    patient: getRelationship(getPatient()),
  });

  cy
    .intercept('GET', '/api/outreach?*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeOutreachStatus');
});
