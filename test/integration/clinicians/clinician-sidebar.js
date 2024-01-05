import { getErrors, getRelationship } from 'helpers/json-api';

import { testTs } from 'helpers/test-timestamp';
import stateColors from 'helpers/state-colors';

import { teamCoordinator, teamNurse } from 'support/api/teams';
import { roleAdmin, roleEmployee, roleManager } from 'support/api/roles';
import { getWorkspaces } from 'support/api/workspaces';
import { getClinician, getCurrentClinician } from 'support/api/clinicians';

const testClinician = getClinician({
  id: '1',
  attributes: {
    name: 'Test Clinician',
    email: 'test.clinician@roundingwell.com',
    last_active_at: testTs(),
    enabled: true,
  },
  relationships: {
    team: getRelationship(teamCoordinator),
    workspaces: getRelationship(getWorkspaces()),
    role: getRelationship(roleEmployee),
  },
});

context('clinician sidebar', function() {
  specify('edit clinician', function() {
    cy
      .routeClinicians(fx => {
        fx.data = [testClinician];

        return fx;
      })
      .visit('/clinicians/1')
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
      .intercept('PATCH', '/api/clinicians/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchClinician');

    cy
      .intercept('POST', '/api/workspaces/11111/relationships/clinicians', {
        statusCode: 204,
        body: {},
      })
      .as('routeAddWorkspaceClinician');

    cy
      .intercept('DELETE', '/api/workspaces/11111/relationships/clinicians', {
        statusCode: 204,
        body: {},
      })
      .as('routeDeleteWorkspaceClinician');

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
        expect(data.relationships.role.data.id).to.equal(roleManager.id);
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
      .wait('@routePatchClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.team.data.id).to.equal(teamNurse.id);
      });

    cy
      .get('[data-workspaces-region]')
      .as('clinicianWorkspaces')
      .find('.list-manager__item')
      .first()
      .should('contain', 'Workspace One')
      .next()
      .should('contain', 'Workspace Two');

    cy
      .get('@clinicianWorkspaces')
      .find('.list-manager__droplist')
      .should('be.disabled');

    cy
      .get('@clinicianWorkspaces')
      .find('.list-manager__item')
      .first()
      .find('.js-remove')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Remove From Workspace?')
      .should('contain', 'Any flow or action owned by this clinician in Workspace One will be set to their team, which is Nurse. Are you sure you want to proceed?')
      .find('.js-submit')
      .contains('Remove From Workspace')
      .click();

    cy
      .wait('@routeDeleteWorkspaceClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal(testClinician.id);
        expect(data[0].type).to.equal('clinicians');
      });

    cy
      .get('[data-list-region]')
      .find('.table-list__item .table-list__cell')
      .eq(1)
      .as('clinicianListItemWorkspaces')
      .should('not.contain', 'Workspace One');

    cy
      .get('@clinicianWorkspaces')
      .find('.list-manager__item')
      .should('have.length', 1);

    cy
      .get('@clinicianWorkspaces')
      .find('.list-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Workspace One')
      .click();

    cy
      .wait('@routeAddWorkspaceClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal(testClinician.id);
        expect(data[0].type).to.equal('clinicians');
      });

    cy
      .get('@clinicianWorkspaces')
      .find('.list-manager__item')
      .contains('Workspace One');

    cy
      .get('@clinicianListItemWorkspaces')
      .should('contain', 'Workspace One, Workspace Two');

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
        fx.data = getCurrentClinician({
          relationships: {
            role: getRelationship(roleAdmin),
          },
        });

        return fx;
      })
      .routeClinicians(fx => {
        fx.data = [testClinician];

        return fx;
      })
      .visit('/clinicians/1')
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
    const inactiveClinician = getClinician({
      id: '1',
      attributes: {
        name: 'Test Clinician',
        email: 'test.clinician@roundingwell.com',
        last_active_at: null,
        enabled: true,
      },
      relationships: {
        team: getRelationship(teamCoordinator),
        workspaces: getRelationship(getWorkspaces()),
        role: getRelationship(roleEmployee),
      },
    });

    cy
      .routeClinicians(fx => {
        fx.data = [inactiveClinician];

        return fx;
      })
      .visit('/clinicians/1')
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
      .intercept('PATCH', '/api/clinicians/1', {
        statusCode: 204,
        body: {},
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

    const errors = getErrors([
      { detail: 'name error', sourceKeys: 'attributes/name' },
      { detail: 'email error', sourceKeys: 'attributes/email' },
    ]);

    cy
      .intercept('PATCH', '/api/clinicians/1', {
        statusCode: 400,
        delay: 100,
        body: { errors },
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
      .routeClinicians()
      .visit('/clinicians/foo')
      .wait('@routeClinicians');

    cy
      .get('.alert-box')
      .contains('The Clinician you requested does not exist.');

    cy
      .url()
      .should('contain', 'clinicians')
      .should('not.contain', 'clinicians/foo');
  });

  specify('view clinician', function() {
    cy
      .routeClinicians(fx => {
        fx.data = [testClinician];

        return fx;
      })
      .visit('/clinicians/1')
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
  });
});
