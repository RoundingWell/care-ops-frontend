import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';
import fxWorkspaces from 'fixtures/test/workspaces.json';
import fxClinicians from 'fixtures/test/clinicians.json';
import fxForms from 'fixtures/test/forms.json';
import fxStates from 'fixtures/test/states.json';


Cypress.Commands.add('routeWorkspaces', (mutator = _.identity) => {
  cy.route({
    url: '/api/workspaces',
    response() {
      const data = getResource(fxWorkspaces, 'workspaces');

      _.each(data, workspace => {
        workspace.relationships = {
          clinicians: { data: getRelationship(fxClinicians, 'clinicians') },
          forms: { data: getRelationship(fxForms, 'forms') },
          states: { data: getRelationship(fxStates, 'states') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeWorkspaces');
});
