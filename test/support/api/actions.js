import _ from 'underscore';
import { v4 as uuid } from 'uuid';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxActions from 'fixtures/collections/actions';

import { getClinician } from './clinicians';
import { getFlow } from './flows';
import { getPatient, getPatients } from './patients';
import { getState } from './states';
import { getTeam } from './teams';

const TYPE = 'patient-actions';

export function getAction(data, { depth = 0 } = {}) {
  if (depth++ > 2) return;

  const defaultRelationships = {
    'author': getRelationship(),
    'comments': getRelationship([]),
    'files': getRelationship([]),
    'flow': getRelationship(),
    'form': getRelationship(),
    'form-responses': getRelationship(),
    'owner': _.random(1) ? getRelationship(getClinician()) : getRelationship(getTeam()),
    'patient': getRelationship(getPatient({}, { depth })),
    'program-action': getRelationship(),
    'recipient': getRelationship(),
    'state': getRelationship(getState()),
  };

  const resource = getResource(_.sample(fxActions), TYPE, defaultRelationships);

  data = _.extend({ id: uuid() }, data);

  return mergeJsonApi(resource, data, { VALID: { relationships: _.keys(defaultRelationships) } });
}

export function getActions({ attributes, relationships, meta } = {}, { sample = 20, depth = 0 } = {}) {
  if (depth + 1 > 2) return;
  return _.times(sample, () => getAction({ attributes, relationships, meta }, { depth }));
}

Cypress.Commands.add('routeAction', (mutator = _.identity) => {
  const data = getAction({
    relationships: {
      state: getRelationship('33333', 'states'),
    },
  });

  cy
    .intercept('GET', '/api/actions/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeAction');
});

Cypress.Commands.add('routeActions', (mutator = _.identity) => {
  const patients = getPatients({}, { sample: 5 });

  const data = getActions({
    relationships() {
      return {
        'patient': getRelationship(_.sample(patients)),
      };
    },
  });

  const included = [...patients];

  const body = mutator({ data, included });

  if (!body.meta) body.meta = { actions: { total: body.data.length } };

  cy
    .intercept('GET', '/api/actions?*', { body })
    .as('routeActions');
});

Cypress.Commands.add('routePatientActions', (mutator = _.identity) => {
  const patient = getPatient();

  const data = getActions({
    relationships: {
      'patient': getRelationship(patient),
    },
  });

  const included = [patient];

  cy
    .intercept('GET', '/api/patients/**/relationships/actions*', {
      body: mutator({ data, included }),
    })
    .as('routePatientActions');
});

Cypress.Commands.add('routeFlowActions', (mutator = _.identity) => {
  const patient = getPatient();
  const flow = getFlow();

  const data = getActions({
    relationships: {
      'patient': getRelationship(patient),
      'flow': getRelationship(flow),
    },
  });

  const included = [patient, flow];

  cy
    .intercept('GET', '/api/flows/**/relationships/actions', {
      body: mutator({ data, included }),
    })
    .as('routeFlowActions');
});
