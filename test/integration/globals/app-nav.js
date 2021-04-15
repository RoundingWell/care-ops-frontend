import _ from 'underscore';
import dayjs from 'dayjs';

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
    const currentDate = dayjs();
    const pastDate = currentDate.subtract(10, 'years');

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
      .get('.modal')
      .as('addPatientModal')
      .should('contain', 'Add Patient');

    cy
      .get('@addPatientModal')
      .contains('First Name')
      .parent()
      .find('.js-input')
      .type('First{enter}');

    cy
      .get('@addPatientModal')
      .contains('Last Name')
      .parent()
      .find('.js-input')
      .type('Last{enter}');

    cy
      .get('@addPatientModal')
      .contains('Date of Birth')
      .parent()
      .find('.date-select__button')
      .click();

    cy
      .get('@addPatientModal')
      .find('.js-submit')
      .should('be.disabled');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(pastDate.year())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(pastDate.format('MMMM'))
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(pastDate.date())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region]')
      .should('contain', pastDate.format('MMM DD, YYYY'))
      .find('.date-select__button')
      .should('not.exist');

    cy
      .get('@addPatientModal')
      .find('.js-submit')
      .should('be.disabled');

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
      .get('@addPatientModal')
      .find('.js-submit')
      .should('be.disabled');

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
      .find('.js-submit')
      .click()
      .wait('@routeAddPatient')
      .wait('@routePatient');

    cy
      .url()
      .should('contain', 'patient/dashboard/1');
  });

  specify('add patient failure', function() {
    const testDate = Date.UTC(2020, 1, 1);
    const futureDate = dayjs(testDate).add(1, 'day');

    cy.clock(testDate, ['Date']);

    const clinicianGroups = [
      {
        type: 'groups',
        id: '1',
        name: 'Group 1',
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
      .get('.modal')
      .as('addPatientModal')
      .find('.js-close .icon')
      .click();

    cy
      .get('.app-nav')
      .find('.js-add-patient')
      .click();

    cy
      .get('@addPatientModal')
      .contains('First Name')
      .parent()
      .find('.js-input')
      .type('First');

    cy
      .get('@addPatientModal')
      .contains('Last Name')
      .parent()
      .find('.js-input')
      .type('Last');

    cy
      .get('@addPatientModal')
      .contains('Date of Birth')
      .parent()
      .find('.date-select__button')
      .click();

    cy
      .get('@addPatientModal')
      .find('.js-submit')
      .should('be.disabled');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(futureDate.year())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(futureDate.format('MMMM'))
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(futureDate.date())
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
      .get('@addPatientModal')
      .find('[data-groups-region]')
      .contains('Group 1');

    cy
      .get('@addPatientModal')
      .find('.modal__error')
      .should('contain', 'Date of birth cannot be in the future');

    cy
      .get('@addPatientModal')
      .find('.date-select__date')
      .should('have.class', 'has-error');

    cy
      .get('@addPatientModal')
      .find('.js-submit')
      .should('be.disabled');

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .js-cancel')
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains(futureDate.subtract(10, 'years').year())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-info-region]')
      .should('be.empty');

    cy
      .get('@addPatientModal')
      .find('.date-select__date')
      .should('not.have.class', 'has-error');

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
      .find('.js-submit')
      .click()
      .wait('@routeSimilarPatientError');

    cy
      .get('@addPatientModal')
      .find('.modal__error')
      .should('contain', 'Similar patient exists');

    cy
      .get('@addPatientModal')
      .find('.js-submit')
      .should('be.disabled');

    cy
      .get('@addPatientModal')
      .find('[data-first-name-region] .js-input')
      .should('have.class', 'has-error');

    cy
      .get('@addPatientModal')
      .find('[data-last-name-region] .js-input')
      .should('have.class', 'has-error')
      .clear()
      .type('New Last');

    cy
      .get('@addPatientModal')
      .find('.js-submit')
      .click()
      .wait('@routeSimilarPatientError');

    cy
      .get('@addPatientModal')
      .find('.modal__error .js-search')
      .click();

    cy
      .get('.modal')
      .find('.patient-search__input')
      .should('have.value', 'First New Last');

    cy
      .get('.modal')
      .find('.js-close .icon')
      .click();

    cy
      .get('.modal')
      .should('not.exist');

    cy.clock().invoke('restore');
  });

  specify('manual add patient disabled', function() {
    cy
      .server()
      .routeSettings(fx => {
        const manualAddPatient = _.find(fx.data, setting => setting.id === 'manual_patient_creation');
        manualAddPatient.attributes.value = false;

        return fx;
      })
      .routeFlows()
      .routePrograms()
      .routePatient()
      .visit();

    cy
      .get('.app-nav')
      .find('.js-add-patient')
      .should('not.exist');
  });
});
