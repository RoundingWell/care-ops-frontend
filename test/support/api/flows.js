import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routePatientFlows', (mutator = _.identity, patientId) => {
  cy
    .fixture('collections/flows').as('fxFlows')
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
    .as('routePatientFlows');
});

Cypress.Commands.add('routeFlow', (mutator = _.identity) => {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/flow-actions').as('fxFlowActions')
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
        'flow-actions': { data: getRelationship(_.sample(this.fxFlowActions, 10), 'program-flow-actions') },
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

Cypress.Commands.add('routeFlowActions', (mutator = _.identity, flowId) => {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/flow-actions').as('fxFlowActions')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('collections/actions').as('fxActions')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: '/api/flows/**/relationships/actions',
    response() {
      const data = getResource(_.sample(this.fxFlowActions, 10), 'flows-actions');
      const actions = getResource(_.sample(this.fxActions, 10), 'patient-actions');
      const flow = _.sample(this.fxFlows);
      flow.id = flowId;

      _.each(data, (flowAction, index) => {
        flowAction.attributes.sequence = index;
        flowAction.relationships = {
          'flow': { data: getRelationship(flow, 'flow') },
          'action': { data: getRelationship(actions[index], 'patient-actions') },
        };
      });

      _.each(actions, action => {
        action.relationships = {
          'program': { data: getRelationship(_.sample(this.fxPrograms), 'program') },
          'patient': { data: getRelationship(_.sample(this.fxPatients), 'patients') },
          'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
          'owner': { data: getRelationship(_.sample(this.fxRoles), 'roles') },
          'form-responses': { data: null },
        };
      });

      return mutator({
        data,
        included: actions,
      });
    },
  })
    .as('routeFlowActions');
});

