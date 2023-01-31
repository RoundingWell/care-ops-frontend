import _ from 'underscore';
import dayjs from 'dayjs';

import { testTs } from 'helpers/test-timestamp';

context('App Nav', function() {
  specify('display non-manager nav', function() {
    let windowStub;
    cy
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role = { data: { id: '33333' } };
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
      .should('contain', 'Sign Out')
      .contains('Help & Support')
      .click()
      .then(() => {
        expect(windowStub).to.have.been.calledOnce;
      });

    cy
      .get('.app-nav')
      .find('.app-nav__bottom')
      .contains('Admin Tools')
      .should('not.exist');
  });

  specify('display nav', function() {
    let logoutStub;
    cy
      .routeFlows()
      .routePrograms()
      .routeDashboards()
      .visit()
      .then(() => {
        const storageItem = JSON.parse(localStorage.getItem('isNavMenuMinimized'));

        expect(storageItem).to.be.false;
      });
    cy
      .getRadio(Radio => {
        logoutStub = cy.stub();
        Radio.reply('auth', 'logout', logoutStub);
      });

    cy
      .get('.app-nav__header')
      .should('contain', 'Cypress Clinic')
      .should('contain', 'Clinician McTester')
      .as('mainNav');

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
      .get('.app-nav')
      .find('.app-nav__bottom-button')
      .contains('Admin Tools')
      .as('adminNav')
      .click();

    cy
      .get('.js-picklist-item')
      .first()
      .click();

    cy
      .url()
      .should('contain', 'dashboards');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .last()
      .should('not.have.class', 'is-selected');

    cy
      .get('@adminNav')
      .click();

    cy
      .get('.js-picklist-item')
      .first()
      .should('have.class', 'is-selected');

    cy
      .get('.js-picklist-item')
      .eq(1)
      .click();

    cy
      .url()
      .should('contain', 'programs');

    cy
      .get('@adminNav')
      .click();

    cy
      .get('.js-picklist-item')
      .eq(1)
      .should('have.class', 'is-selected');

    cy
      .get('.js-picklist-item')
      .last()
      .click();

    cy
      .url()
      .should('contain', 'clinicians');

    cy
      .get('@adminNav')
      .click();

    cy
      .get('.js-picklist-item')
      .last()
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .click();

    cy
      .get('.picklist')
      .should('not.exist');

    cy
      .get('@adminNav')
      .click();

    cy
      .get('.js-picklist-item')
      .last()
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

  specify('minimized nav menu', function() {
    localStorage.setItem('isNavMenuMinimized', true);

    cy
      .routeSettings(fx => {
        fx.data.push({ id: 'manual_patient_creation', attributes: { value: true } });

        return fx;
      })
      .routeFlows()
      .routePrograms()
      .routeDashboards()
      .visit();

    cy
      .get('.app-nav__header')
      .should('not.contain', 'Cypress Clinic')
      .should('not.contain', 'Clinician McTester');

    cy
      .get('.app-nav__header')
      .find('img')
      .should('have.attr', 'src', '/rwell-logo.svg');

    cy
      .get('.app-nav__header')
      .click()
      .get('.picklist');

    cy
      .get('.app-nav__header')
      .should('have.class', 'is-active');

    cy
      .get('.app-frame__content')
      .click('left');

    cy
      .get('[data-nav-content-region]')
      .find('.js-search')
      .should('not.contain', 'Search')
      .click();

    cy
      .get('.modal')
      .find('.js-close')
      .click();

    cy
      .get('.app-nav__title')
      .should('not.exist');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .as('worklists');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .should('have.length', 6);

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .should('not.contain', 'Owned By')
      .should('not.contain', 'Schedule')
      .should('not.contain', 'Shared By')
      .should('not.contain', 'New < 1 Day')
      .should('not.contain', 'Updated < 3 Days')
      .should('not.contain', 'Done < 30 Days');

    cy
      .get('.app-nav__bottom')
      .find('.app-nav__bottom-button')
      .should('have.length', 3)
      .should('not.contain', 'Add Patient')
      .should('not.contain', 'Admin Tools')
      .should('not.contain', 'Minimize Menu');

    cy
      .get('.app-nav__bottom')
      .find('.app-nav__bottom-button')
      .last()
      .find('.fa-square-caret-right');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .eq(1)
      .click();

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .eq(1)
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .should('not.have.class', 'is-selected');

    cy
      .get('.app-nav__bottom')
      .find('.app-nav__bottom-button')
      .last()
      .as('minimizeMenuButton')
      .click()
      .then(() => {
        const storageItem = JSON.parse(localStorage.getItem('isNavMenuMinimized'));

        expect(storageItem).to.be.false;
      });

    cy
      .get('.app-nav__header')
      .should('contain', 'Cypress Clinic')
      .should('contain', 'Clinician McTester');

    cy
      .get('[data-nav-content-region]')
      .find('.js-search')
      .should('contain', 'Search');

    cy
      .get('.app-nav__title');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .should('contain', 'Owned By')
      .should('contain', 'Schedule')
      .should('contain', 'Shared By')
      .should('contain', 'New < 1 Day')
      .should('contain', 'Updated < 3 Days')
      .should('contain', 'Done < 30 Days');

    cy
      .get('.app-nav__bottom')
      .find('.app-nav__bottom-button')
      .should('have.length', 3)
      .should('contain', 'Add Patient')
      .should('contain', 'Admin Tools')
      .should('contain', 'Minimize Menu');

    cy
      .get('.app-nav__bottom')
      .find('.app-nav__bottom-button')
      .last()
      .find('.fa-square-caret-left');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .eq(1)
      .should('have.class', 'is-selected');

    cy
      .get('.app-nav')
      .find('.app-nav__bottom-button')
      .contains('Admin Tools')
      .click();

    cy
      .get('.js-picklist-item')
      .first()
      .click();

    cy
      .get('@minimizeMenuButton')
      .click()
      .then(() => {
        const storageItem = JSON.parse(localStorage.getItem('isNavMenuMinimized'));

        expect(storageItem).to.be.true;
      });

    cy
      .get('.app-nav')
      .find('.app-nav__bottom-button')
      .eq(1)
      .click();

    cy
      .get('.js-picklist-item')
      .first()
      .should('have.class', 'is-selected');
  });

  specify('add patient success', function() {
    const currentDate = dayjs();
    const pastDate = currentDate.subtract(10, 'years');

    const clinicianWorkspaces = [
      {
        type: 'workspaces',
        id: '1',
        name: 'Group 1',
      },
      {
        type: 'workspaces',
        id: '2',
        name: 'Group 2',
      },
      {
        type: 'workspaces',
        id: '3',
        name: 'Group 3',
      },
      {
        type: 'workspaces',
        id: '4',
        name: 'Group 4',
      },
      {
        type: 'workspaces',
        id: '5',
        name: 'Group 5',
      },
      {
        type: 'workspaces',
        id: '6',
        name: 'Group 6',
      },
      {
        type: 'workspaces',
        id: '7',
        name: 'Group 7',
      },
      {
        type: 'workspaces',
        id: '8',
        name: 'Group 8',
      },
      {
        type: 'workspaces',
        id: '9',
        name: 'Group 9',
      },
      {
        type: 'workspaces',
        id: '10',
        name: 'Group 10',
      },
    ];

    const testClinician = {
      id: '1',
      attributes: {
        name: 'Test Clinician',
        email: 'test.clinician@roundingwell.com',
        enabled: true,
        last_active_at: testTs(),
      },
      relationships: {
        team: { data: { id: '11111' } },
        workspaces: { data: clinicianWorkspaces },
        role: { data: { id: '22222' } },
      },
    };

    cy
      .routeWorkspacesBootstrap(_.identity, clinicianWorkspaces)
      .routeSettings(fx => {
        fx.data.push({ id: 'manual_patient_creation', attributes: { value: true } });

        return fx;
      })
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
      .find('.js-picklist-item')
      .contains(pastDate.year())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains(pastDate.format('MMMM'))
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
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
      .find('.js-picklist-item')
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
        .find('[data-workspaces-region] [data-droplist-region] button')
        .click();

      cy
        .get('.picklist')
        .find('.js-picklist-item')
        .first()
        .click();

      i--;
    }

    cy
      .get('@addPatientModal')
      .find('[data-workspaces-region] [data-droplist-region] button')
      .should('be.disabled');

    cy
      .get('@addPatientModal')
      .find('[data-workspaces-region] .js-remove')
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
    const testDate = dayjs().year(2020).month(0).day(1).utc().valueOf();
    const futureDate = dayjs(testDate).add(1, 'day');

    cy.clock(testDate, ['Date']);

    const clinicianWorkspaces = [
      {
        type: 'workspaces',
        id: '1',
        name: 'Group 1',
      },
    ];

    const testClinician = {
      id: '1',
      attributes: {
        name: 'Test Clinician',
        email: 'test.clinician@roundingwell.com',
        enabled: true,
        last_active_at: testTs(),
      },
      relationships: {
        team: { data: { id: '11111' } },
        workspaces: { data: clinicianWorkspaces },
        role: { data: { id: '22222' } },
      },
    };

    cy
      .routeWorkspacesBootstrap(_.identity, clinicianWorkspaces)
      .routeSettings(fx => {
        fx.data.push({ id: 'manual_patient_creation', attributes: { value: true } });

        return fx;
      })
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
      .find('.js-picklist-item')
      .contains(futureDate.year())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains(futureDate.format('MMMM'))
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains(futureDate.date())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-sex-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .first()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-workspaces-region]')
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
      .find('.js-picklist-item')
      .contains(futureDate.subtract(10, 'years').year())
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .first()
      .click();

    cy
      .get('@addPatientModal')
      .find('[data-dob-region] .date-select__button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
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
      .routeSettings(fx => {
        fx.data.push({ id: 'manual_patient_creation', attributes: { value: false } });

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
