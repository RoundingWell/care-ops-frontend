import _ from 'underscore';

import { getError, getRelationship } from 'helpers/json-api';

import { testTs } from 'helpers/test-timestamp';

const stateColors = Cypress.env('stateColors');

const groups = [
  {
    id: '1',
    name: 'Group One',
  },
  {
    id: '2',
    name: 'Group Two',
  },
];

const testClinician = {
  id: '1',
  attributes: {
    name: 'Test Clinician',
    email: 'test.clinician@roundingwell.com',
    last_active_at: testTs(),
    enabled: true,
  },
  relationships: {
    team: { data: { id: '11111' } },
    groups: { data: getRelationship(groups, 'groups') },
    role: { data: { id: '33333' } },
  },
};

context('clinician sidebar', function() {
  specify('edit clinician', function() {
    cy
      .routeGroupsBootstrap(_.identity, groups)
      .routeCurrentClinician(fx => {
        fx.data.relationships.groups.data = groups;
        fx.data.relationships.role.data.id = '11111';
        return fx;
      })
      .visit()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 1);
        fx.data[0] = testClinician;

        return fx;
      })
      .routeClinician(fx => {
        fx.data = testClinician;

        return fx;
      })
      .navigate('/clinicians/1')
      .wait('@routeClinicians');

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Clinician')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.value', 'test.clinician@roundingwell.com')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/clinicians/1',
        response: {},
      })
      .as('routePatchClinician');

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
        method: 'POST',
        url: '/api/groups/1/relationships/clinicians',
        response: {},
      })
      .as('routeAddGroupClinician');

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/groups/1/relationships/clinicians',
        response: {},
      })
      .as('routeDeleteGroupClinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-state-region]')
      .contains('Active')
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
      .get('@clinicianSidebar')
      .find('[data-team-region] button')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-state-region]')
      .contains('Disabled')
      .click();

    cy
      .get('.picklist')
      .contains('Active')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.enabled).to.be.true;
      });

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('not.contain', 'Admin');

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
      .get('@clinicianSidebar')
      .find('[data-team-region] button')
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
      .get('[data-groups-region]')
      .as('clinicianGroups')
      .find('.list-manager__item')
      .first()
      .should('contain', 'Group One')
      .next()
      .should('contain', 'Group Two');

    cy
      .get('@clinicianGroups')
      .find('.list-manager__droplist')
      .should('be.disabled');

    cy
      .get('@clinicianGroups')
      .find('.list-manager__item')
      .first()
      .find('.js-remove')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Remove From Group?')
      .should('contain', 'Any flow or action owned by this clinician in Group One will be set to their team, which is Nurse. Are you sure you want to proceed?')
      .find('.js-submit')
      .contains('Remove From Group')
      .click();

    cy
      .wait('@routeDeleteGroupClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal('1');
        expect(data[0].type).to.equal('clinicians');
      });

    cy
      .get('[data-list-region]')
      .find('.table-list__item .table-list__cell')
      .eq(1)
      .as('clinicianListItemGroups')
      .should('not.contain', 'Group One');

    cy
      .get('@clinicianGroups')
      .find('.list-manager__item')
      .should('have.length', 1);

    cy
      .get('@clinicianGroups')
      .find('.list-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Group One')
      .click();

    cy
      .wait('@routeAddGroupClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal('1');
        expect(data[0].type).to.equal('clinicians');
      });

    cy
      .get('@clinicianGroups')
      .find('.list-manager__item')
      .contains('Group One');

    cy
      .get('@clinicianListItemGroups')
      .should('contain', 'Group One, Group Two');

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .should('contain', 'Test Clinician')
      .should('have.not.class', 'is-selected');

    cy
      .url()
      .should('contain', 'clinicians')
      .should('not.contain', 'clinicians/1');
  });

  specify('admin clinician', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.groups.data = groups;
        fx.data.relationships.role.data.id = '22222';
        return fx;
      })
      .visit()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 1);
        fx.data[0] = testClinician;

        return fx;
      })
      .routeClinician(fx => {
        fx.data = testClinician;

        return fx;
      })
      .navigate('/clinicians/1')
      .wait('@routeClinicians');

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('contain', 'Admin');
  });

  specify('never active clinician', function() {
    const inactiveClinician = {
      id: '1',
      attributes: {
        name: 'Test Clinician',
        email: 'test.clinician@roundingwell.com',
        last_active_at: null,
        enabled: true,
      },
      relationships: {
        team: { data: { id: '11111' } },
        groups: { data: getRelationship(groups, 'groups') },
        role: { data: { id: '33333' } },
      },
    };

    cy
      .routeGroupsBootstrap(_.identity, groups)
      .visit()
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 1);
        fx.data[0] = inactiveClinician;

        return fx;
      })
      .routeClinician(fx => {
        fx.data = inactiveClinician;

        return fx;
      })
      .navigate('/clinicians/1')
      .wait('@routeClinicians');

    cy
      .get('.sidebar')
      .as('clinicianSidebar')
      .find('[data-save-region]')
      .as('saveRegion')
      .find('button')
      .should('not.exist');

    cy
      .get('@clinicianSidebar')
      .find('[data-state-region]')
      .contains('Pending');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .clear()
      .type('Edited Clinician Name');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .clear()
      .type('edited.email@roundingwell.com')
      .tab()
      .tab()
      .should('have.class', 'js-cancel')
      .typeEnter();

    cy
      .get('@saveRegion')
      .find('button')
      .should('not.exist');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Clinician')
      .clear()
      .type('Edited Clinician Name');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/clinicians/1',
        response: {},
      })
      .as('routePatchClinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.value', 'test.clinician@roundingwell.com')
      .clear()
      .type('edited.email@roundingwell.com')
      .tab()
      .should('have.class', 'js-save')
      .typeEnter();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Edited Clinician Name');
        expect(data.attributes.email).to.equal('edited.email@roundingwell.com');
      });

    cy
      .get('@saveRegion')
      .find('button')
      .should('not.exist');

    const errors = _.map({ name: 'name error', email: 'email error' }, getError);

    cy
      .route({
        status: 400,
        delay: 100,
        method: 'PATCH',
        url: '/api/clinicians/1',
        response: { errors },
      })
      .as('routePatchClinicianError');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .clear()
      .type('edited.email@roundingwell.com')
      .tab()
      .typeEnter()
      .wait('@routePatchClinicianError');

    cy
      .get('@clinicianSidebar')
      .find('[data-save-region] button')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .should('contain', 'name error')
      .find('.js-input')
      .should('have.css', 'border-top-color', stateColors.error);

    cy
      .get('.sidebar')
      .find('[data-email-region]')
      .should('contain', 'email error')
      .find('.js-input')
      .should('have.css', 'border-top-color', stateColors.error);
  });

  specify('clinician does not exist', function() {
    cy
      .visit('clinicians/2');

    cy
      .get('.alert-box')
      .contains('The Clinician you requested does not exist.');

    cy
      .url()
      .should('contain', 'clinicians')
      .should('not.contain', 'clinicians/2');
  });

  specify('view clinician', function() {
    cy
      .routeClinicians(fx => {
        fx.data[0].id = 1;
        fx.data[0].attributes.name = 'Test Clinician';
        fx.data[0].attributes.email = 'Test.Clinician@roundingwell.com';

        return fx;
      })
      .visit('clinicians/1')
      .wait('@routeClinicians');

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Clinician')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.value', 'Test.Clinician@roundingwell.com')
      .should('be.disabled');
  });
});
