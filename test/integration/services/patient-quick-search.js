import _ from 'underscore';

context('Patient Quick Search', function() {
  specify('Modal', function() {
    cy
      .server()
      .routeGroupActions(_.identity, '1')
      .routePatient()
      .routePatientActions()
      .routeAction()
      .routeActionActivity()
      .routePatientSearch(fx => {
        _.each(fx.data, (patient, index) => {
          patient.attributes.first_name = 'Test';
          patient.attributes.last_name = `${ index } Patient`;
        });

        return fx;
      })
      .visit('/worklist/owned-by-me')
      .wait('@routeGroupActions');

    cy
      .get('.app-frame__nav')
      .find('.js-search')
      .as('search')
      .click();

    cy
      .get('@search')
      .should('have.class', 'is-active');

    cy
      .get('.patient-search__modal')
      .as('searchModal')
      .should('contain', 'Tip: Try searching by first name or last name')
      .find('.patient-search__input')
      .should('have.attr', 'placeholder', 'Search for patients')
      .type('Test');

    cy
      .wait('@routePatientSearch')
      .its('url')
      .should('contain', '?filter[search]=Te');

    cy
      .get('@searchModal')
      .find('.picklist__item')
      .should('have.length', 10);

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type(' 1');

    cy
      .get('@searchModal')
      .find('.picklist__item')
      .should('have.length', 1)
      .first()
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/2');

    cy
      .get('@search')
      .click();

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .type('Foo');

    cy
      .get('@searchModal')
      .should('contain', 'No results match your query');

    cy
      .get('@searchModal')
      .find('.patient-search__input')
      .clear();

    cy
      .get('@searchModal')
      .should('contain', 'Tip: Try searching by first name or last name');

    cy
      .get('@searchModal')
      .find('.js-close')
      .click();
  });
});
