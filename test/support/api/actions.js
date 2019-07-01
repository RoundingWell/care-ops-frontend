import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

function generateData(patients) {
  const data = getResource(_.sample(this.fxActions, 20), 'actions');
  let included = [];

  _.each(data, action => {
    const clinician = _.sample(this.fxClinicians);
    const actionEvents = _.sample(this.fxEvents, 2);
    const patient = _.sample(patients);

    action.relationships = {
      patient: { data: getRelationship(patient, 'patients') },
      events: { data: getRelationship(actionEvents, 'events') },
      state: { data: getRelationship(_.sample(this.fxStates), 'states') },
    };

    included = getIncluded(included, actionEvents, 'events');
    included = getIncluded(included, patient, 'patients');

    if (_.random(1)) {
      action.relationships.clinician = {
        data: getRelationship(clinician, 'clinicians'),
      };

      included = getIncluded(included, clinician, 'clinicians');
    } else {
      action.relationships.role = {
        data: getRelationship(_.sample(this.fxRoles), 'roles'),
      };
    }
  });

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routePatientActions', (mutator = _.identity, patientId) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/events').as('fxEvents')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/patients/**/relationships/actions*',
    response() {
      const patient = _.sample(this.fxPatients);
      patient.id = patientId;
      return mutator(
        generateData.call(this, [patient])
      );
    },
  })
    .as('routeAction');
});

Cypress.Commands.add('routeGroupActions', (mutator = _.identity) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/events').as('fxEvents')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/actions?*',
    response() {
      return mutator(
        generateData.call(this, _.sample(this.fxPatients, 5))
      );
    },
  })
    .as('routeGroupActions');
});
