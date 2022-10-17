import _ from 'underscore';

import { getError } from 'helpers/json-api';

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

context('clinicians modal', function() {
  specify('add clinician', function() {
    cy
      .routeGroupsBootstrap(_.identity, groups)
      .routeCurrentClinician(fx => {
        fx.data.relationships.groups.data = groups;
        return fx;
      })
      .visit()
      .routeClinicians()
      .navigate('/clinicians')
      .wait('@routeClinicians');

    cy
      .get('.js-add-clinician')
      .click();

    cy
      .get('.modal')
      .as('modal')
      .find('.js-submit')
      .should('be.disabled');

    cy
      .get('@modal')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'Clinician First Last Name')
      .type('Test Clinician')
      .type('{enter}');

    cy
      .get('@modal')
      .find('[data-email-region] .js-input')
      .should('have.attr', 'placeholder', 'clinician@organization.com')
      .type('test.clinician@roundingwell.com')
      .type('{enter}');

    cy
      .get('@modal')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Manager')
      .click();

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/clinicians',
        response: {
          data: {
            enabled: true,
            last_active_at: '2021-10-18T04:25:22.961Z',
          },
        },
      })
      .as('routePostClinician');

    cy
      .get('.modal')
      .as('modal')
      .find('.js-submit')
      .should('not.be.disabled');

    cy
      .get('@modal')
      .find('[data-team-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .get('@modal')
      .get('[data-groups-region] .groups-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Group One')
      .click();

    cy
      .get('@modal')
      .get('[data-groups-region] .groups-manager__droplist')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Group Two')
      .click();

    cy
      .get('@modal')
      .find('.groups-manager__item')
      .last()
      .find('.js-remove')
      .click();

    cy
      .get('@modal')
      .find('.js-submit')
      .click();

    cy
      .wait('@routePostClinician')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Test Clinician');
        expect(data.attributes.email).to.equal('test.clinician@roundingwell.com');
        expect(data.relationships.role.data.id).to.equal('11111');
        expect(data.relationships.team.data.id).to.equal('22222');
        expect(data.relationships.groups.data[0].id).to.equal('1');
      });

    cy
      .get('.js-add-clinician')
      .click();

    cy
      .get('@modal')
      .find('[data-footer-region] .js-close')
      .click();

    cy
      .get('@modal')
      .should('not.exist');

    cy
      .get('.js-add-clinician')
      .click();

    cy
      .get('.modal')
      .as('modal');

    cy
      .get('@modal')
      .find('[data-name-region] .js-input')
      .type('Test Clinician');

    cy
      .get('@modal')
      .find('[data-email-region] .js-input')
      .type('test.clinician@roundingwell.com');

    cy
      .get('@modal')
      .find('[data-role-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Manager')
      .click();

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
      .get('@modal')
      .find('[data-footer-region]')
      .find('.js-submit')
      .click()
      .wait('@routePostClinicianError');

    cy
      .get('.alert-box')
      .should('contain', 'name error, email error');

    cy
      .get('@modal')
      .find('[data-name-region] .js-input')
      .should('have.css', 'border-top-color', stateColors.error);

    cy
      .get('@modal')
      .find('[data-email-region] .js-input')
      .should('have.css', 'border-top-color', stateColors.error);
  });
});
