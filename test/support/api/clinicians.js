import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';
import fxGroups from 'fixtures/collections/groups.json';
import fxTestClinicians from 'fixtures/test/clinicians.json';
import fxTeams from 'fixtures/test/teams.json';

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy.route({
    url: '/api/clinicians/me',
    response() {
      const clinician = getResource(_.find(fxTestClinicians, { id: '11111' }), 'clinicians');

      clinician.attributes.last_active_at = dayjs.utc().format();

      const groups = _.sample(fxGroups, 2);
      groups[0].id = '11111';
      groups[1].id = '22222';

      clinician.relationships.groups = {
        data: getRelationship(groups, 'groups'),
      };

      clinician.relationships.team = {
        data: getRelationship(_.find(fxTeams, { id: '22222' }), 'teams'),
      };

      return mutator({
        data: clinician,
        included: getIncluded([], groups, 'groups'),
      });
    },
  })
    .as('routeCurrentClinician');
});

Cypress.Commands.add('routeClinicians', (mutator = _.identity, clinicians) => {
  cy
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('test/teams').as('fxTeams');

  cy.route({
    url: '/api/clinicians',
    response() {
      let included = [];
      const groups = _.sample(this.fxGroups, 2);
      clinicians = clinicians || _.sample(this.fxClinicians, 9);
      clinicians = getResource(clinicians, 'clinicians');

      _.each(clinicians, (clinician, i) => {
        if (clinician.relationships.team || clinician.id === '11111') return;
        const teamIndex = (i >= this.fxTeams.length) ? i - this.fxTeams.length : i;
        clinician.relationships.team = {
          data: getRelationship(this.fxTeams[teamIndex], 'teams'),
        };
        clinician.relationships.groups = {
          data: getRelationship(groups, 'groups'),
        };
      });

      included = getIncluded(included, groups, 'groups');

      return mutator({
        data: clinicians,
        included,
      });
    },
  })
    .as('routeClinicians');
});

Cypress.Commands.add('routeClinician', (mutator = _.identity) => {
  cy
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('test/teams').as('fxTeams');

  cy.route({
    url: /\/api\/clinicians\/[^me]+/,
    response() {
      let included = [];
      const groups = _.sample(this.fxGroups, 2);
      const clinician = getResource(_.sample(this.fxClinicians), 'clinicians');

      clinician.relationships.team = {
        data: getRelationship(_.sample(this.fxTeams), 'teams'),
      };

      clinician.relationships.groups = {
        data: getRelationship(groups, 'groups'),
      };

      included = getIncluded(included, groups, 'groups');

      return mutator({
        data: clinician,
        included,
      });
    },
  })
    .as('routeClinician');
});
