import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

function flowFixtures() {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');
}

function generateData(patients = _.sample(this.fxPatients, 1)) {
  const data = getResource(_.sample(this.fxFlows, 10), 'flows');
  let included = [];

  _.each(data, flow => {
    const patient = _.sample(patients);
    const programFlow = _.sample(this.fxProgramFlows);
    const programActions = _.sample(this.fxProgramActions, 10);
    const program = _.sample(this.fxPrograms);
    programFlow.relationships = {};
    programFlow.relationships.program = { data: { id: programFlow.id } };
    programFlow.relationships['program-actions'] = { data: getRelationship(programActions, 'program-actions') };

    included = getIncluded(included, patient, 'patients');
    included = getIncluded(included, programFlow, 'program-flows');
    included = getIncluded(included, program, 'programs');
    included = getIncluded(included, programActions, 'program-actions');

    flow.relationships = {
      'program-flow': { data: getRelationship(programFlow, 'program-flows') },
      'patient': { data: getRelationship(patient, 'patients') },
      'actions': { data: getRelationship(_.sample(this.fxActions, 10), 'patient-actions') },
      'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
      'owner': { data: null },
    };

    flow.meta = {
      progress: { complete: 0, total: 5 },
    };

    if (_.random(1)) {
      const clinician = _.sample(this.fxClinicians);

      // NOTE: Uses includes for testing relationships
      included = getIncluded(included, clinician, 'clinicians');

      flow.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };
    } else {
      flow.relationships.owner = {
        data: getRelationship(_.sample(this.fxRoles), 'roles'),
      };
    }
  });

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routeFlow', (mutator = _.identity) => {
  flowFixtures();

  cy.route({
    url: '/api/flows/*',
    response() {
      const apiData = generateData.call(this);
      apiData.data = _.sample(apiData.data);
      return mutator(apiData);
    },
  })
    .as('routeFlow');
});

Cypress.Commands.add('routePatientFlows', (mutator = _.identity, patientId = '1') => {
  flowFixtures();

  cy.route({
    url: '/api/patients/**/relationships/flows*',
    response() {
      const patient = _.sample(this.fxPatients);
      patient.id = patientId;
      return mutator(
        generateData.call(this, [patient]),
      );
    },
  })
    .as('routePatientFlows');
});


Cypress.Commands.add('routeFlows', (mutator = _.identity, delay) => {
  flowFixtures();

  cy.route({
    delay,
    url: '/api/flows?*',
    response() {
      return mutator(generateData.call(this, _.sample(this.fxPatients, 5)));
    },
  })
    .as('routeFlows');
});
