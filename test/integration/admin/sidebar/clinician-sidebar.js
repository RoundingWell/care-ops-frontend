import _ from 'underscore';

import { getError } from 'helpers/json-api';
import { testTs } from 'helpers/test-moment';

const stateColors = Cypress.env('stateColors');

context('clinician sidebar', function() {
  specify('edit clinician', function() {
    const clinicianGroups = [
      {
        type: 'groups',
        id: '1',
      },
      {
        type: 'groups',
        id: '2',
      },
    ];

    const testClinician = {
      id: '1',
      attributes: {
        name: 'Test Clinician',
        email: 'test.clinician@roundingwell.com',
        access: 'employee',
        last_active_at: testTs(),
      },
      relationships: {
        role: { data: { id: '11111' } },
        groups: { data: clinicianGroups },
      },
    };

    cy
      .server()
      .routeGroupsBootstrap(_.identity, [
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
      .get('@clinicianSidebar')
      .find('.js-menu')
      .should('not.exist');

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
        url: '/api/clinicians/1/relationships/role',
        response: {},
      })
      .as('routePutRole');

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
      .contains('Active');

    cy
      .get('@clinicianSidebar')
      .find('[data-access-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Manager')
      .click();

    cy
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.access).to.equal('manager');
      });

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePutRole')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.equal('22222');
        expect(data.type).to.equal('roles');
      });

    cy
      .get('[data-groups-region]')
      .as('clinicianGroups')
      .find('.clinician-groups__item')
      .first()
      .should('contain', 'Group One')
      .next()
      .should('contain', 'Group Two');

    cy
      .get('@clinicianGroups')
      .find('.clinician-groups__droplist')
      .should('be.disabled');

    cy
      .get('@clinicianGroups')
      .find('.clinician-groups__item')
      .first()
      .find('.js-remove')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Remove From Group?')
      .should('contain', 'Any flow or action owned by this clinician in Group One will be set to their role, which is Nurse. Are you sure you want to proceed?')
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
      .find('.clinician-groups__item')
      .should('have.length', 1);

    cy
      .get('@clinicianGroups')
      .find('.clinician-groups__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
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
      .find('.clinician-groups__item')
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

  specify('never active clinician', function() {
    const clinicianGroups = [
      {
        type: 'groups',
        id: '1',
      },
      {
        type: 'groups',
        id: '2',
      },
    ];

    const testClinician = {
      id: '1',
      attributes: {
        name: 'Test Clinician',
        email: 'test.clinician@roundingwell.com',
        access: 'employee',
        last_active_at: null,
      },
      relationships: {
        role: { data: { id: '11111' } },
        groups: { data: clinicianGroups },
      },
    };

    cy
      .server()
      .routeGroupsBootstrap(_.identity, [
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

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/clinicians/1',
        response: {},
      })
      .as('routeDeleteClinician');

    cy
      .get('@clinicianSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Delete Clinician')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Confirm Delete')
      .should('contain', 'Are you sure you want to delete this clinician account from your organization? This cannot be undone.')
      .find('.js-submit')
      .contains('Delete Clinician')
      .click()
      .wait('@routeDeleteClinician');

    cy
      .url()
      .should('contain', 'clinicians')
      .should('not.contain', 'clinicians/1');

    cy
      .get('.table-list .table-empty-list')
      .contains('No Clinicians');
  });

  specify('add clinician', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, [
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
      .routeClinicians()
      .routeClinician(fx => {
        fx.data.id = '1';

        return fx;
      })
      .navigate('/clinicians/new')
      .wait('@routeClinicians');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.attr', 'placeholder', 'New Clinician')
      .type('Test Clinician')
      .type('{enter}');

    cy
      .get('.sidebar')
      .find('[data-save-region] button')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .clear();

    cy
      .get('.sidebar')
      .find('[data-email-region] .js-input')
      .should('have.attr', 'placeholder', 'clinician@organization.com')
      .type('test.clinician@roundingwell.com')
      .type('{enter}');

    cy
      .get('.sidebar')
      .find('[data-save-region] button')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Clinician');

    cy
      .get('.sidebar')
      .find('[data-groups-region] [data-droplist-region] button')
      .should('be.disabled');

    cy
      .get('[data-save-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .contains('New Clinician')
      .should('not.exist');

    cy
      .get('.js-add-clinician')
      .click();

    cy
      .get('.sidebar')
      .as('clinicianSidebar');

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .should('have.attr', 'placeholder', 'New Clinician')
      .type('Test Clinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .should('have.attr', 'placeholder', 'clinician@organization.com')
      .type('test.clinician@roundingwell.com');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-groups-region] button')
      .should('be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('.sidebar__info')
      .should('not.exist');

    const errors = _.map({ name: 'name error', email: 'email error' }, getError);

    cy
      .route({
        status: 400,
        delay: 100,
        method: 'POST',
        url: '/api/clinicians',
        response: { errors },
      })
      .as('routePostClinicianError');

    cy
      .get('@clinicianSidebar')
      .find('[data-save-region]')
      .find('.js-save')
      .click()
      .wait('@routePostClinicianError');

    cy
      .get('@clinicianSidebar')
      .find('[data-save-region] button')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .should('contain', 'name error')
      .find('.js-input')
      .should('have.css', 'border-color', stateColors.error);

    cy
      .get('.sidebar')
      .find('[data-email-region]')
      .should('contain', 'email error')
      .find('.js-input')
      .should('have.css', 'border-color', stateColors.error);

    cy
      .get('@clinicianSidebar')
      .find('[data-name-region] .js-input')
      .type('s');

    cy
      .get('@clinicianSidebar')
      .find('[data-email-region] .js-input')
      .type('s');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/clinicians',
        response: {
          data: {
            id: '1',
          },
        },
      })
      .as('routePostClinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-save-region]')
      .find('.js-save')
      .click()
      .wait('@routePostClinician');

    cy
      .get('@clinicianSidebar')
      .get('[data-save-region]')
      .find('.js-save')
      .should('not.exist');

    cy
      .url()
      .should('contain', 'clinicians/1');

    cy
      .get('@clinicianSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Delete Clinician');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .should('not.be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('[data-groups-region] button')
      .should('not.be.disabled');

    cy
      .get('@clinicianSidebar')
      .find('.sidebar__info')
      .should('contain', 'Role & Groups must be assigned in order for this clinician to have access to members.');

    cy
      .get('@clinicianSidebar')
      .get('[data-groups-region] .clinician-groups__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Group One')
      .click();

    cy
      .get('@clinicianSidebar')
      .find('.sidebar__info');

    cy
      .get('@clinicianSidebar')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .get('@clinicianSidebar')
      .find('.sidebar__info')
      .should('not.exist');

    cy
      .get('@clinicianSidebar')
      .get('[data-groups-region] .clinician-groups__item')
      .first()
      .find('.js-remove')
      .click();

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click();

    cy
      .get('@clinicianSidebar')
      .find('.sidebar__info');
  });

  specify('clinician does not exist', function() {
    cy
      .server()
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
      .server()
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
