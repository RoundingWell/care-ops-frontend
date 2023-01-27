import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testTs } from 'helpers/test-timestamp';

context('clinicians list', function() {
  specify('display clinicians list', function() {
    cy
      .routeWorkspacesBootstrap(_.identity, [
        {
          id: '1',
          name: 'Group One',
        },
        {
          id: '2',
          name: 'Group Two',
        },
      ])
      .visit()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 2);
        _.each(fx.data, clinician => {
          clinician.relationships.workspaces = {
            data: [
              {
                type: 'workspaces',
                id: '1',
              },
              {
                type: 'workspaces',
                id: '2',
              },
            ],
          };
        });

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Aaron Aaronson';
        fx.data[0].attributes.enabled = true;
        fx.data[0].attributes.last_active_at = testTs();
        fx.data[0].relationships.role.data.id = '33333';
        fx.data[0].relationships.team.data.id = '11111';

        fx.data[1].attributes.name = 'Baron Baronson';
        fx.data[1].attributes.enabled = true;
        fx.data[1].attributes.last_active_at = null;

        return fx;
      })
      .navigate('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.list-page__list')
      .find('.table-list__header')
      .first()
      .should('contain', 'Clinician')
      .next()
      .should('contain', 'Groups')
      .next()
      .should('contain', 'Role, Team')
      .next()
      .should('contain', 'Last Sign In');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .last()
      .should('contain', 'Baron Baronson');

    cy
      .get('.table-list')
      .find('.table-list__item .table-list__cell')
      .first()
      .should('contain', 'Aaron Aaronson')
      .next()
      .should('contain', 'Group One, Group Two')
      .next()
      .find('.clinician-state--active')
      .parents('.table-list__cell')
      .next()
      .should('contain', formatDate(testTs(), 'TIME_OR_DAY'))
      .prev()
      .contains('Employee')
      .click();

    cy
      .get('.table-list')
      .find('.table-list__item')
      .eq(1)
      .find('.table-list__cell')
      .first()
      .should('contain', 'Baron Baronson')
      .next()
      .should('contain', 'Group One, Group Two')
      .next()
      .find('.clinician-state--pending')
      .parents('.table-list__cell')
      .next()
      .contains('Never');

    cy
      .route({
        status: 204,
        method: 'PUT',
        url: '/api/clinicians/1/relationships/team',
        response: {},
      })
      .as('routePutTeam');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/clinicians/*',
        response: {},
      })
      .as('routePatchClinician');

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Manager')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('11111');
      });

    cy
      .get('.table-list')
      .find('.table-list__item .table-list__cell')
      .contains('CO')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePutTeam')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.equal('22222');
        expect(data.type).to.equal('teams');
      });

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .as('firstItem');

    cy
      .get('@firstItem')
      .find('[data-state-region]')
      .find('button')
      .click();

    cy
      .get('.picklist')
      .contains('Disabled')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.enabled).to.be.false;
      });

    cy
      .get('@firstItem')
      .contains('NUR')
      .should('be.disabled');

    cy
      .get('@firstItem')
      .contains('Manager')
      .should('be.disabled');

    cy
      .get('@firstItem')
      .find('[data-state-region]')
      .find('button')
      .click();

    cy
      .get('@firstItem')
      .click();

    cy
      .url()
      .should('contain', 'clinicians/1');

    cy
      .get('@firstItem')
      .contains('Aaron Aaronson')
      .parent()
      .should('have.class', 'is-selected');
  });

  specify('empty clinicians list', function() {
    cy
      .routeWorkspacesBootstrap()
      .visit()
      .routeClinicians(fx => {
        fx.data = [];

        return fx;
      })
      .navigate('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.table-empty-list')
      .contains('No Clinicians');
  });

  specify('find in list', function() {
    cy
      .routeWorkspacesBootstrap(_.identity, [
        {
          id: '1',
          name: 'Group One',
        },
        {
          id: '2',
          name: 'Group Two',
        },
      ])
      .visit()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Aaron Aaronson';
        fx.data[0].attributes.enabled = true;
        fx.data[0].relationships.workspaces = { data: [{ type: 'workspaces', id: '1' }] };
        fx.data[0].relationships.role.data.id = '33333';

        fx.data[1].attributes.name = 'Baron Baronson';
        fx.data[1].attributes.enabled = true;
        fx.data[1].relationships.workspaces = { data: [{ type: 'workspaces', id: '2' }] };
        fx.data[1].relationships.role.data.id = '22222';

        return fx;
      })
      .navigate('/clinicians');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:disabled')
      .should('have.attr', 'placeholder', 'Find in List...');

    cy
      .wait('@routeClinicians');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:not([disabled])')
      .as('listSearch')
      .type('abc')
      .next()
      .should('have.class', 'js-clear');

    cy
      .get('.list-page__list')
      .as('cliniciansList')
      .find('.table-empty-list')
      .should('contain', 'No results match your Find in List search');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@cliniciansList')
      .find('.table-list__item')
      .should('have.length', 2);

    cy
      .get('@listSearch')
      .next()
      .should('not.be.visible');

    cy
      .get('@listSearch')
      .type('Aaron');

    cy
      .get('@cliniciansList')
      .find('.table-list__item')
      .should('have.length', 1)
      .first()
      .should('contain', 'Aaron Aaronson');

    cy
      .get('@listSearch')
      .clear()
      .type('Group One');

    cy
      .get('@cliniciansList')
      .find('.table-list__item')
      .should('have.length', 1)
      .first()
      .should('contain', 'Group One');

    cy
      .get('@listSearch')
      .clear()
      .type('Employee');

    cy
      .get('@cliniciansList')
      .find('.table-list__item')
      .should('have.length', 1)
      .first()
      .should('contain', 'Employee');
  });
});
