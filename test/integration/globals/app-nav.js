import _ from 'underscore';

import { testTs } from 'helpers/test-timestamp';

context('App Nav', function() {
  specify('display non-manager nav', function() {
    let windowStub;
    cy
      .server()
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.access = 'employee';
        return fx;
      })
      .routeFlows()
      .routePrograms()
      .visit();

    cy
      .window()
      .then(win => {
        windowStub = win.open;
      });
    cy
      .get('.app-nav__header')
      .click();

    cy
      .get('.picklist')
      .should('not.contain', 'Workspace')
      .should('not.contain', 'Admin')
      .should('contain', 'Sign Out')
      .contains('Help')
      .click()
      .then(() => {
        expect(windowStub).to.have.been.calledOnce;
      });
  });

  specify('display nav', function() {
    let logoutStub;
    cy
      .server()
      .routeFlows()
      .routePrograms()
      .visit();

    cy
      .getRadio(Radio => {
        logoutStub = cy.stub();
        Radio.reply('auth', 'logout', logoutStub);
      });

    cy
      .get('.app-nav__header')
      .should('contain', 'Cypress Clinic')
      .should('contain', 'Clinician McTester')
      .as('mainNav')
      .click();

    cy
      .get('.picklist')
      .find('.is-selected')
      .should('contain', 'Workspace');

    cy
      .get('.picklist')
      .contains('Admin')
      .click();

    cy
      .url()
      .should('contain', 'programs');

    cy
      .get('[data-nav-content-region]')
      .contains('Programs')
      .should('have.class', 'is-selected');

    cy
      .get('[data-nav-content-region]')
      .contains('Clinicians')
      .click();

    cy
      .url()
      .should('contain', 'clinicians');

    cy
      .get('@mainNav')
      .click();

    cy
      .get('.picklist')
      .contains('Workspace')
      .click();

    cy
      .url()
      .should('contain', 'worklist/owned-by');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .as('worklists');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .last()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .should('not.have.class', 'is-selected');

    cy
      .get('@mainNav')
      .click();

    cy
      .get('.picklist')
      .contains('Sign Out')
      .click()
      .then(() => {
        expect(logoutStub).to.have.been.calledOnce;
      });
  });

  specify('add patient success', function() {
    const clinicianGroups = [
      {
        type: 'groups',
        id: '1',
        name: 'Group 1',
      },
      {
        type: 'groups',
        id: '2',
        name: 'Group 2',
      },
      {
        type: 'groups',
        id: '3',
        name: 'Group 3',
      },
      {
        type: 'groups',
        id: '4',
        name: 'Group 4',
      },
      {
        type: 'groups',
        id: '5',
        name: 'Group 5',
      },
      {
        type: 'groups',
        id: '6',
        name: 'Group 6',
      },
      {
        type: 'groups',
        id: '7',
        name: 'Group 7',
      },
      {
        type: 'groups',
        id: '8',
        name: 'Group 8',
      },
      {
        type: 'groups',
        id: '9',
        name: 'Group 9',
      },
      {
        type: 'groups',
        id: '10',
        name: 'Group 10',
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
      .routeGroupsBootstrap(_.identity, clinicianGroups)
      .routeClinicians(fx => {
        fx.data = _.sample(fx.data, 1);
        fx.data[0] = testClinician;

        return fx;
      })
      .routeCurrentClinician(fx => {
        fx.data = testClinician;

        return fx;
      })
      .routeFlows()
      .routePrograms()
      .routePatient()
      .visit();

    cy
      .get('.app-nav')
      .find('.js-add-patient')
      .click();

    cy
      .get('.add-patient__modal')
      .as('addPatientModal')
      .find('h2')
      .should('contain', 'Add Patient');

    cy
      .get('@addPatientModal')
      .find('.add-patient__form-section')
      .first()
      .should('contain', 'First Name')
      .find('.js-input')
      .type('First{enter}')
      .parents('.add-patient__form-section')
      .next()
      .should('contain', 'Last Name')
      .find('.js-input')
      .type('Last{enter}')
      .parents('.add-patient__form-section')
      .next()
      .should('contain', 'Date of Birth')
      .find('.js-date')
      .click();

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .should('be.disabled');
    cy
      .get('.datepicker')
      .find('.js-prev')
      .click();

    cy
      .get('.datepicker')
      .find('li:not(.is-other-month)')
      .first()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-sex-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    let i = 10;
    while (i > 0) {
      cy
        .get('@addPatientModal')
        .find('[data-groups-region] [data-droplist-region] button')
        .click();

      cy
        .get('.picklist')
        .find('.picklist__item')
        .first()
        .click();

      i--;
    }

    cy
      .get('@addPatientModal')
      .find('[data-groups-region] [data-droplist-region] button')
      .should('be.disabled');

    cy
      .get('@addPatientModal')
      .find('[data-groups-region] .js-remove')
      .first()
      .click();

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/patients',
        response: {
          data: {
            id: '1',
            first_name: 'First',
            last_name: 'Last',
          },
        },
      })
      .as('routeAddPatient');

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .click()
      .wait('@routeAddPatient')
      .wait('@routePatient');

    cy
      .url()
      .should('contain', 'patient/dashboard/1');
  });

  specify('add patient failure', function() {
    cy
      .server()
      .routeFlows()
      .routePrograms()
      .routePatient()
      .visit();

    cy
      .get('.app-nav')
      .find('.js-add-patient')
      .click();

    cy
      .get('.add-patient__modal')
      .as('addPatientModal')
      .find('.js-close')
      .click();

    cy
      .get('.app-nav')
      .find('.js-add-patient')
      .click();

    cy
      .get('@addPatientModal')
      .find('.js-cancel')
      .click();

    cy
      .get('.app-nav')
      .find('.js-add-patient')
      .click();

    cy
      .get('@addPatientModal')
      .find('.add-patient__form-section')
      .first()
      .should('contain', 'First Name')
      .find('.js-input')
      .type('First')
      .parents('.add-patient__form-section')
      .next()
      .should('contain', 'Last Name')
      .find('.js-input')
      .type('Last')
      .parents('.add-patient__form-section')
      .next()
      .should('contain', 'Date of Birth')
      .find('.js-date')
      .click();

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .should('be.disabled');

    cy
      .get('.datepicker')
      .find('.js-prev')
      .click();

    cy
      .get('.datepicker')
      .find('li:not(.is-other-month)')
      .first()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-sex-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .route({
        status: 400,
        method: 'POST',
        url: '/api/patients',
        response: {
          errors: [{
            status: '400',
            title: 'Bad Request',
            detail: 'Similar patient exists',
          }],
        },
      })
      .as('routeSimilarPatientError');

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .click()
      .wait('@routeSimilarPatientError');

    cy
      .get('@addPatientModal')
      .find('.add-patient__error')
      .should('contain', 'Similar patient exists');

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .should('be.disabled');

    cy
      .get('@addPatientModal')
      .find('[data-first-name-region] .js-input')
      .should('have.class', 'has-error');

    cy
      .get('@addPatientModal')
      .find('[data-last-name-region] .js-input')
      .should('have.class', 'has-error')
      .type('New Last');

    cy
      .get('@addPatientModal')
      .find('.js-date')
      .click();

    cy
      .get('.datepicker')
      .find('.is-today')
      .parent()
      .next()
      .click();

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .click();

    cy
      .get('@addPatientModal')
      .find('.add-patient__error')
      .should('contain', 'Date of birth cannot be in the future');

    cy
      .get('@addPatientModal')
      .find('.js-date')
      .should('have.class', 'has-error');

    cy
      .get('@addPatientModal')
      .find('.js-save')
      .should('be.disabled');

    cy
      .get('@addPatientModal')
      .find('.js-date')
      .click();

    cy
      .get('.datepicker')
      .find('.is-today')
      .parent()
      .prev()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-error-region]')
      .should('be.empty');

    cy
      .get('@addPatientModal')
      .find('.js-date')
      .should('not.have.class', 'has-error');
  });
});
