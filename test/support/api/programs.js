import _ from 'underscore';
import { v4 as uuid } from 'uuid';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxPrograms from 'fixtures/collections/programs';

import { getProgramFlows } from './program-flows';
import { getProgramActions } from './program-actions';
import { getWorkspaces } from './workspaces';

const TYPE = 'programs';

export function getProgram(data, { depth = 0 } = {}) {
  if (depth++ > 2) return;
  const defaultRelationships = {
    'workspaces': getRelationship(getWorkspaces({}, { depth: 0 })),
    'program-actions': getRelationship(getProgramActions({}, { sample: 20, depth })),
    'program-flows': getRelationship(getProgramFlows({}, { sample: 5, depth })),
  };

  const resource = getResource(_.sample(fxPrograms), TYPE, defaultRelationships);

  data = _.extend({ id: uuid() }, data);

  return mergeJsonApi(resource, data, { VALID: { relationships: _.keys(defaultRelationships) } });
}

export function getPrograms({ attributes, relationships, meta } = {}, { sample = 10, depth = 0 } = {}) {
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
  const data = getPrograms();

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
  const data = getPrograms();

  cy
    .intercept('GET', '/api/workspaces/**/relationships/programs*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeWorkspacePrograms');
});

