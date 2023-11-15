import _ from 'underscore';
import { getResource } from 'helpers/json-api';


const TYPE = 'outreach';

const fxOutreach = {
  id: '11111',
  phone_end: '1234',
};

Cypress.Commands.add('routeOutreachStatus', (mutator = _.identity) => {
  const data = getResource(fxOutreach, TYPE);

  cy
    .intercept('GET', '/api/outreach?*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeOutreachStatus');
});
