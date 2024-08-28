import _ from 'underscore';

import { getRelationship, getResource } from 'helpers/json-api';

import { getPatient } from 'support/api/patients';

context('Patient Quick Search', function() {
  const patients = _.times(10, index => {
    return getPatient({
      attributes: {
        first_name: 'Test',
        last_name: `${ index } Patient`,
        identifiers: index % 2 ? [] : [{ type: 'mrn', value: 'identifier-001' }],
      },
    });
  });

  beforeEach(function() {
    const data = _.map(patients, patient => {
      const { id, first_name, last_name, birth_date, identifiers } = patient.attributes;

      return {
        id,
        type: 'patient-search-results',
        attributes: {
          first_name,
          last_name,
          birth_date,
          identifiers,
        },
        relationships: {
          patient: getRelationship(patient, 'patients'),
        },
      };
    });

    cy
      .intercept({
        method: 'GET',
        url: 'api/patients?filter*',
      }, req => {
        if (req.url.includes('None')) {
          req.reply({ body: { data: [] } });
          req.alias = 'routeEmptyPatientSearch';
          return;
        }
        req.reply({
          body: {
            data,
            included: [...getResource(patients, 'patients')],
          },
          delay: 300,
        });
        req.alias = 'routePatientSearch';
      });
  });

  specify('Modal', function() {
    cy
      .routesForPatientDashboard()
      .routeActions()
      .visit()
      .wait('@routeActions');

    cy
      .get('.app-frame__nav')
      .find('.js-search')
      .as('search')
      .click();

    cy
      .get('@search')
      .should('have.class', 'is-active');

    cy
      .get('.modal')
      .as('searchModal')
      .should('contain', 'Search by')
      .find('.patient-search__input')
      .should('have.attr', 'placeholder', 'Search for patients');

    cy
      .get('@searchModal')
      .find('.qa-search-option')
      .should('have.length', 3);

    cy
      .get('@searchModal')
      .find('.qa-search-option')
      .first()
      .should('contain', 'Date of Birth')
      .should('contain', 'For example: MM/DD/YYYY');

    cy
      .get('@searchModal')
      .find('.qa-search-option')
      .eq(1)
      .should('contain', 'Medical Record Number')
      .should('contain', 'For example: A234567');

    cy
      .get('@searchModal')
      .find('.qa-search-option')
      .last()
      .should('contain', 'Health Plan ID')
      .should('contain', 'For example: 123456789');

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('Test');

    cy
      .wait('@routePatientSearch')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[search]=Te');

    cy
      .get('@searchModal')
      .find('.js-picklist-item')
      .should('have.length', 10);

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type(' 2')
      .wait('@routePatientSearch')
      .wait(100); // wait for debounce

    cy
      .get('@searchModal')
      .find('.js-picklist-item strong')
      .contains('2')
      .parents('.js-picklist-item')
      .contains('identifier-001')
      .click();

    cy
      .url()
      .should('contain', `patient/dashboard/${ patients[2].id }`);

    cy
      .get('@search')
      .click();

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('None')
      .wait('@routeEmptyPatientSearch');

    cy
      .get('@searchModal')
      .should('contain', 'No results match your query')
      .should('not.contain', 'Add Patient');

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .clear();

    cy
      .get('@searchModal')
      .should('contain', 'Search by');

    cy
      .get('@searchModal')
      .find('.js-close')
      .click();

    cy
      .get('@searchModal')
      .should('not.exist');

    cy
      .get('.app-nav')
      .find('.app-nav__bottom-button')
      .contains('Admin Tools')
      .click();

    cy
      .get('.js-picklist-item')
      .contains('Programs')
      .click();

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .first()
      .click()
      .wait('@routeActions');

    cy
      .get('body')
      .type('/');

    cy
      .get('@searchModal')
      .should('contain', 'Search by');

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('Tes')
      .wait(200)
      .type('ting')
      .wait('@routePatientSearch')
      .wait(100); // wait for debounce

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('{backspace}{backspace}{backspace}{backspace}{backspace}');

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('s')
      .wait('@routePatientSearch');

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('{leftArrow}{backspace}{backspace}')
      .wait(100); // wait for debounce

    cy
      .get('@searchModal')
      .should('contain', 'Search by');

    cy
      .go('back');
  });

  specify('No Results with Patient Add', function() {
    cy
      .routeSettings(fx => {
        fx.data.push({ id: 'manual_patient_creation', attributes: { value: true } });

        return fx;
      })
      .routesForPatientDashboard()
      .routeActions()
      .visit()
      .wait('@routeActions');

    cy
      .get('.app-frame__nav')
      .find('.js-search')
      .as('search')
      .click();

    cy
      .get('.modal')
      .as('searchModal')
      .find('.patient-search__input')
      .type('None')
      .wait('@routeEmptyPatientSearch');

    cy
      .get('@searchModal')
      .should('contain', 'No results match your query.')
      .contains('Add Patient')
      .click();

    cy
      .get('.modal')
      .should('contain', 'Add Patient');
  });
});
