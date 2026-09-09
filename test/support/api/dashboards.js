import _ from 'underscore';
import { v7 as uuid } from 'uuid';

import { getResource, mergeJsonApi } from 'helpers/json-api';

import fxTestDashboards from 'fixtures/collections/dashboards';

const TYPE = 'dashboards';
export const SUPERSET_DOMAIN = 'https://superset.example.com';

export function getDashboard(data) {
  const resource = getResource(_.sample(fxTestDashboards), TYPE);

  data = _.extend({ id: uuid() }, data);

  const embed_url = `https://us-west-2.quicksight.aws.amazon.com/embed/embed_id/dashboards/${ data.id }?identityprovider=quicksight`;
  data.attributes = _.extend({ provider: 'quicksight', embed_url }, data.attributes);

  return mergeJsonApi(resource, data);
}

function encodeSegment(segment) {
  return btoa(JSON.stringify(segment))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function getGuestToken({ expiresIn = 300 } = {}) {
  return [
    encodeSegment({ alg: 'HS256', typ: 'JWT' }),
    encodeSegment({ exp: Math.floor(Date.now() / 1000) + expiresIn }),
    'signature',
  ].join('.');
}

export function getSupersetDashboard(data) {
  data = _.extend({ id: uuid() }, data);

  data.attributes = _.extend({
    provider: 'superset',
    embed_url: null,
    embed_config: {
      domain: SUPERSET_DOMAIN,
      dashboard_uuid: data.id,
    },
    guest_token: getGuestToken(),
  }, data.attributes);

  return getDashboard(data);
}

export function getDashboards({ attributes } = {}, { sample = 3 } = {}) {
  return _.times(sample, () => getDashboard({ attributes }));
}

Cypress.Commands.add('routeDashboards', (mutator = _.identity) => {
  const data = getDashboards();

  cy
    .intercept('GET', '/api/dashboards', {
      body: mutator({ data, included: [] }),
    })
    .as('routeDashboards');
});

Cypress.Commands.add('routeDashboard', (mutator = _.identity) => {
  const data = getDashboard();

  cy
    .intercept('GET', '/api/dashboards/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeDashboard');
});

Cypress.Commands.add('routeDashboardGuestToken', (token = getGuestToken()) => {
  cy
    .intercept('POST', '/api/dashboards/*/guest-token', {
      body: {
        data: {
          type: 'dashboard-guest-tokens',
          id: 'guest-token',
          attributes: { token },
        },
      },
    })
    .as('routeDashboardGuestToken');
});

Cypress.Commands.add('routeSupersetEmbed', () => {
  cy
    .intercept('GET', `${ SUPERSET_DOMAIN }/**`, req => {
      req.reply('<html><body>Superset Embed</body></html>');
    })
    .as('routeSupersetEmbed');
});
