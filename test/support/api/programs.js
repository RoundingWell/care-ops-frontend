import _ from 'underscore';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxPrograms from 'fixtures/collections/programs';

import { getProgramFlows } from './program-flows';
import { getProgramActions } from './program-actions';
import { workspaceOne, workspaceTwo } from './workspaces';

const TYPE = 'programs';

let programs;

export function getProgram(data, { depth = 0 } = {}) {
  if (depth++ > 2) return;

  const defaultRelationships = {
    'workspaces': getRelationship([workspaceOne, workspaceTwo]),
    'program-actions': getRelationship(getProgramActions({}, { sample: 10, depth })),
    'program-flows': getRelationship(getProgramFlows({}, { sample: 3, depth })),
  };

  const resource = getResource(_.sample(fxPrograms), TYPE, defaultRelationships);

  return mergeJsonApi(resource, data, { VALID: { relationships: _.keys(defaultRelationships) } });
}

export function getPrograms({ attributes, relationships, meta } = {}, { depth = 0, sample = 3 } = {}) {
  if (depth + 1 > 2) return;

  return _.times(sample, () => getProgram({ attributes, relationships, meta }, { depth }));
}

Cypress.Commands.add('routeProgram', (mutator = _.identity) => {
  const data = getProgram();

  cy
    .intercept('GET', '/api/programs/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeProgram');
});

Cypress.Commands.add('routePrograms', (mutator = _.identity) => {
  programs = programs || getPrograms();
  const data = programs;

  cy
    .intercept('GET', '/api/programs', {
      body: mutator({ data, included: [] }),
    })
    .as('routePrograms');
});

Cypress.Commands.add('routeProgramByProgramFlow', (mutator = _.identity) => {
  const programFlows = getProgramFlows();

  const data = getProgram({
    relationships: {
      'program-flows': getRelationship(programFlows),
    },
  });

  const included = [...programFlows];

  cy
    .intercept('GET', '/api/program-flows/**/program', {
      body: mutator({ data, included }),
    })
    .as('routeProgramByProgramFlow');
});

Cypress.Commands.add('routeWorkspacePrograms', (mutator = _.identity) => {
  programs = programs || getPrograms();
  const data = programs;

  cy
    .intercept('GET', '/api/workspaces/**/relationships/programs*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeWorkspacePrograms');
});

