import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testTs } from 'helpers/test-timestamp';

context('clinicians list', function() {
  specify('display clinicians list', function() {
    cy
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 2);

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
      .visit('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.list-page__list')
      .find('.table-list__header')
      .first()
      .should('contain', 'Clinician')
      .next()
      .should('contain', 'Workspaces')
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
      .should('contain', 'Workspace One, Workspace Two')
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
      .should('contain', 'Workspace One, Workspace Two')
      .next()
      .find('.clinician-state--pending')
      .parents('.table-list__cell')
      .next()
      .contains('Never');

    cy
      .intercept('PATCH', '/api/clinicians/*', {
        statusCode: 204,
        body: {},
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
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.team.data.id).to.equal('22222');
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
      .routeClinicians(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.table-empty-list')
      .contains('No Clinicians');
  });

  specify('find in list', function() {
    cy
      .routesForDefault()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Aaron Aaronson';
        fx.data[0].attributes.enabled = true;
        fx.data[0].relationships.workspaces = { data: [{ type: 'workspaces', id: '11111' }] };
        fx.data[0].relationships.role.data.id = '33333';

        fx.data[1].attributes.name = 'Baron Baronson';
        fx.data[1].attributes.enabled = true;
        fx.data[1].relationships.workspaces = { data: [{ type: 'workspaces', id: '22222' }] };
        fx.data[1].relationships.role.data.id = '22222';

        return fx;
      })
      .routeActions()
      .visit('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .as('listSearch')
      .type('abc');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('have.class', 'is-applied');

    cy
      .get('.list-page__list')
      .as('cliniciansList')
      .find('.table-empty-list')
      .should('contain', 'No results match your Find in List search');

    cy
      .get('@listSearch')
      .next()
      .should('have.class', 'js-clear')
      .click();

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('not.have.class', 'is-applied');

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
      .type('Workspace One');

    cy
      .get('@cliniciansList')
      .find('.table-list__item')
      .should('have.length', 1)
      .first()
      .should('contain', 'Workspace One');

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

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Owned By')
      .click()
      .wait('@routeActions');

    cy
      .go('back')
      .wait('@routeClinicians');

    cy
      .get('@listSearch')
      .should('have.attr', 'value', 'Employee');
  });
});
