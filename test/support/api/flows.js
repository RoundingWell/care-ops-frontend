import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

function flowFixtures() {
  cy
    .fixture('collections/flows').as('fxFlows')
    .fixture('collections/actions').as('fxActions')
    .fixture('test/clinicians').as('fxClinicians')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('test/teams').as('fxTeams')
    .fixture('test/states').as('fxStates');
}

function generateData(patients = _.sample(this.fxPatients, 5)) {
  const data = getResource(_.sample(this.fxFlows, 10), 'flows');
  const programFlows = _.sample(this.fxProgramFlows, 5);
  const programActionsSample = _.sample(this.fxProgramActions, 20);
  const programs = _.sample(this.fxPrograms, 1);
  let included = [];

  included = getIncluded(included, patients, 'patients');
  included = getIncluded(included, programFlows, 'program-flows');
  included = getIncluded(included, programs, 'programs');
  included = getIncluded(included, programActionsSample, 'program-actions');

  _.each(data, flow => {
    const patient = _.sample(patients);
    const programFlow = _.sample(programFlows);
    const programActions = _.sample(programActionsSample, 10);
    const program = _.sample(programs);
    programFlow.relationships = {};
    programFlow.relationships.program = { data: { id: program.id } };
    programFlow.relationships['program-actions'] = { data: getRelationship(programActions, 'program-actions') };

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
      const clinician = _.sample(_.rest(this.fxClinicians));

      flow.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };
    } else {
      flow.relationships.owner = {
        data: getRelationship(_.sample(this.fxTeams), 'teams'),
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

Cypress.Commands.add('routePatientFlows', (mutator = _.identity) => {
  flowFixtures();

  cy.route({
    url: '/api/patients/**/relationships/flows*',
    response() {
      return mutator(
        generateData.call(this),
      );
    },
  })
    .as('routePatientFlows');
});


Cypress.Commands.add('routeFlows', (mutator = _.identity) => {
  flowFixtures();

  cy.route({
    url: '/api/flows?*',
    response() {
      const apiData = mutator(generateData.call(this));

      if (!apiData.meta) apiData.meta = { flows: { total: apiData.data.length } };

      return apiData;
    },
  })
    .as('routeFlows');
});
