import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeAction', (mutator = _.identity) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: '/api/patients/*/action',
    response() {
      const data = getResource(_.sample(this.fxActions, 10), 'actions');
      let included = [];

      included = getIncluded(included, this.fxRoles, 'role');
      included = getIncluded(included, this.fxStates, 'state');

      _.each(data, action => {
        const clinician = _.sample(this.fxClinicians);
        const patient = _.sample(this.fxPatients);

        action.relationships = {
          clinician: { data: getRelationship(clinician, 'clinician') },
          patient: { data: getRelationship(patient, 'patient') },
          role: { data: getRelationship(_.sample(this.fxRoles), 'role') },
          state: { data: getRelationship(_.sample(this.fxStates), 'state') },
        };

        included = getIncluded(included, clinician, 'clinician');
        included = getIncluded(included, patient, 'patient');
      });

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routeAction');
});
