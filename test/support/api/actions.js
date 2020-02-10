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
      owner: { data: null },
    };

    included = getIncluded(included, actionEvents, 'events');
    included = getIncluded(included, patient, 'patients');

    if (_.random(1)) {
      action.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };

      included = getIncluded(included, clinician, 'clinicians');
    } else {
      action.relationships.owner = {
        data: getRelationship(_.sample(this.fxRoles), 'roles'),
      };
    }
  });

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routeAction', (mutator = _.identity) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: '/api/actions/*',
    response() {
      const action = getResource(_.sample(this.fxActions), 'actions');

      action.relationships = {
        'patient': { data: getRelationship(_.sample(this.fxPatients), 'patients') },
        'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
        'owner': { data: getRelationship(_.sample(this.fxRoles), 'roles') },
        'form-responses': { data: null },
      };

      return mutator({
        data: action,
        included: [],
      });
    },
  })
    .as('routeAction');

  cy.routeProgramByAction();
});

Cypress.Commands.add('routePatientActions', (mutator = _.identity, patientId) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/action-events').as('fxEvents')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

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
    .as('routePatientActions');
});

Cypress.Commands.add('routeGroupActions', (mutator = _.identity) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/action-events').as('fxEvents')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

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

Cypress.Commands.add('routeActionPatient', (mutator = _.identity) => {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/patient-fields').as('fxPatientFields')
    .fixture('collections/groups').as('fxGroups');

  cy.route({
    url: '/api/actions/*/patient',
    response() {
      const data = getResource(_.sample(this.fxPatients), 'patients');
      const groups = _.sample(this.fxGroups, 2);
      const fields = _.sample(this.fxPatientFields, 2);
      const action = _.sample(this.fxActions);
      let included = [];

      included = getIncluded(included, fields, 'patient-fields');

      data.relationships = {
        'actions': { data: getRelationship(action, 'actions') },
        'groups': { data: getRelationship(groups, 'groups') },
        'patient-fields': { data: getRelationship(fields, 'patient-fields') },
      };

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routeActionPatient');
});
