import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestRoles from 'fixtures/test/roles';

const TYPE = 'roles';

export function getRole() {
  return getResource(_.sample(fxTestRoles), TYPE);
}

export function getRoles() {
  return getResource(fxTestRoles, TYPE);
}

const roles = getRoles();

export const roleAdmin = _.find(roles, { id: '22222' });
export const roleManager = _.find(roles, { id: '11111' });
export const roleEmployee = _.find(roles, { id: '33333' });
export const roleReducedEmployee = _.find(roles, { id: '44444' });
export const roleNoFilterEmployee = _.find(roles, { id: '66666' });
export const roleTeamEmployee = _.find(roles, { id: '77777' });

Cypress.Commands.add('routeRoles', (mutator = _.identity) => {
  const data = getResource(fxTestRoles, TYPE);

  cy
    .intercept('GET', '/api/roles', {
      body: mutator({ data, included: [] }),
    })
    .as('routeRoles');
});
