import _ from 'underscore';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxActions from 'fixtures/collections/actions';
import fxPatients from 'fixtures/collections/patients';
import fxFlows from 'fixtures/collections/flows';

import fxTestClinicians from 'fixtures/test/clinicians';
import fxTestTeams from 'fixtures/test/teams';
import fxTestStates from 'fixtures/test/states';

export function getAction(data) {
  const defaultRelationships = {
    'author': getRelationship(),
    'comments': getRelationship([]),
    'files': getRelationship([]),
    'flow': getRelationship(),
    'form': getRelationship(),
    'form-responses': getRelationship(),
    'owner': _.random(1) ? getRelationship(_.sample(fxTestClinicians), 'clinicians') : getRelationship(_.sample(fxTestTeams), 'teams'),
    'patient': getRelationship(_.sample(fxPatients), 'patients'),
    'program-action': getRelationship(),
    'recipient': getRelationship(),
    'state': getRelationship(_.sample(fxTestStates), 'states'),
  };

  const action = getResource(_.sample(fxActions), 'patient-actions', defaultRelationships);

  return mergeJsonApi(action, data, { VALID: { relationships: _.keys(defaultRelationships) } });
}

export function getActions({ attributes, relationships, meta } = {}, { sample = 20 } = {}) {
  const actions = _.sample(fxActions, sample);
  return _.map(actions, ({ id }) => getAction({ id, attributes, relationships, meta }));
}

Cypress.Commands.add('routeAction', (mutator = _.identity) => {
  const data = getAction({
    relationships: {
      state: getRelationship('33333', 'states'),
    },
  });

  cy.intercept('GET', '/api/actions/*', {
    body: mutator({ data, included: [] }),
  })
    .as('routeAction');
});

Cypress.Commands.add('routeActions', (mutator = _.identity) => {
  const patients = _.sample(fxPatients, 5);

  const data = getActions({
    relationships() {
      return {
        'patient': getRelationship(_.sample(patients), 'patients'),
      };
    },
  });

  const included = [...getResource(patients, 'patients')];

  const body = mutator({ data, included });

  if (!body.meta) body.meta = { actions: { total: body.data.length } };

  cy
    .intercept('GET', '/api/actions?*', { body })
    .as('routeActions');
});

Cypress.Commands.add('routePatientActions', (mutator = _.identity) => {
  const patient = _.sample(fxPatients);

  const data = getActions({
    relationships: {
      'patient': getRelationship(patient, 'patients'),
    },
  });

  const included = [getResource(patient, 'patients')];

  cy
    .intercept('GET', '/api/patients/**/relationships/actions*', {
      body: mutator({ data, included }),
    })
    .as('routePatientActions');
});

Cypress.Commands.add('routeFlowActions', (mutator = _.identity) => {
  const patient = _.sample(fxPatients);
  const flow = _.sample(fxFlows);

  const data = getActions({
    relationships: {
      'patient': getRelationship(patient, 'patients'),
      'flow': getRelationship(flow, 'flows'),
    },
  });

  const included = [
    getResource(patient, 'patients'),
    getResource(flow, 'flows'),
  ];

  cy
    .intercept('GET', '/api/flows/**/relationships/actions', {
      body: mutator({ data, included }),
    })
    .as('routeFlowActions');
});
