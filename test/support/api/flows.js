import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routePatientFlows', (mutator = _.identity, patientId) => {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/action-events').as('fxActionEvents')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: '/api/patients/**/relationships/flows*',
    response() {
      const data = getResource(_.sample(this.fxFlows, 10), 'flows');
      const patient = _.sample(this.fxPatients);
      const clinician = _.sample(this.fxClinicians);
      let included = [getResource(patient, 'patients')];

      _.each(data, flow => {
        flow.relationships = {
          'program-flow': { data: getRelationship(getResource(_.sample(this.fxProgramFlows), 'program-flow'), 'program-flows') },
          'patient': { data: getRelationship(patient, 'patients') },
          'actions': { data: getRelationship(_.sample(this.fxActions, 10), 'patient-actions') },
          'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
          'owner': { data: null },
        };

        if (_.random(1)) {
          flow.relationships.owner = {
            data: getRelationship(clinician, 'clinicians'),
          };

          included = getIncluded(included, clinician, 'clinicians');
        } else {
          flow.relationships.owner = {
            data: getRelationship(_.sample(this.fxRoles), 'roles'),
          };
        }
      });

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routePatientFlows');
});

Cypress.Commands.add('routeGroupFlows', (mutator = _.identity) => {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/flow-actions').as('fxFlowActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: '/api/flows?*',
    response() {
      const data = getResource(_.sample(this.fxFlows, 10), 'flows');
      const patient = _.sample(this.fxPatients);
      const clinician = _.sample(this.fxClinicians);
      let included = [getResource(patient, 'patients')];

      _.each(data, flow => {
        flow.relationships = {
          'program-flow': { data: getRelationship(getResource(_.sample(this.fxProgramFlows), 'program-flow'), 'program-flows') },
          'patient': { data: getRelationship(patient, 'patients') },
          'flow-actions': { data: getRelationship(_.sample(this.fxFlowActions, 10), 'program-flow-actions') },
          'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
          'owner': { data: null },
        };

        if (_.random(1)) {
          flow.relationships.owner = {
            data: getRelationship(clinician, 'clinicians'),
          };

          included = getIncluded(included, clinician, 'clinicians');
        } else {
          flow.relationships.owner = {
            data: getRelationship(_.sample(this.fxRoles), 'roles'),
          };
        }
      });

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routeGroupFlows');
});


Cypress.Commands.add('routeFlow', (mutator = _.identity) => {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: '/api/flows/*',
    response() {
      const data = getResource(_.sample(this.fxFlows), 'flows');
      const patient = _.sample(this.fxPatients);

      data.relationships = {
        'program-flow': { data: getRelationship(_.sample(this.fxProgramFlows), 'program-flows') },
        'patient': { data: getRelationship(patient, 'patients') },
        'actions': { data: getRelationship(_.sample(this.fxActions, 10), 'patient-actions') },
        'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
        'owner': { data: getRelationship(_.sample(this.fxRoles), 'roles') },
      };

      return mutator({
        data,
        included: [getResource(patient, 'patients')],
      });
    },
  })
    .as('routeFlow');
});
