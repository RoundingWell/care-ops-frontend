import _ from 'underscore';
import { getIncluded, getRelationship } from 'helpers/json-api';

function tempResponse() {
  const patient = _.sample(this.fxPatients);
  const action = _.sample(this.fxActions);

  patient.first_name = 'Testin';

  let included = [];

  included = getIncluded(included, patient, 'patients');
  included = getIncluded(included, action, 'patient-actions');

  included[1].relationships = {
    patient: { data: getRelationship(patient, 'patients') },
    events: { data: [] },
    state: { data: getRelationship(_.sample(this.fxStates), 'states') },
    clinician: { data: null },
    role: { data: getRelationship(_.sample(this.fxRoles), 'roles') },
  };

  return {
    data: {
      id: 'test-form',
      attributes: {
        name: 'Foo Form',
      },
      relationships: {
        patient: { data: getRelationship(patient, 'patients') },
        action: { data: getRelationship(action, 'patient-actions') },
      },
    },
    included,
  };
}

context('Patient Form', function() {
  beforeEach(function() {
    cy
      .fixture('collections/actions').as('fxActions')
      .fixture('collections/patients').as('fxPatients')
      .fixture('test/roles').as('fxRoles')
      .fixture('test/states').as('fxStates');

    // NOTE: This represents the minimal amount of data to create the layout
    // And not the data expectations for this feature
    cy
      .server()
      .routeActionActivity()
      .route({
        url: '/api/temp-test-form',
        response: tempResponse,
      })
      .as('testForm')
      .visit('patient-action/1/form/1')
      .wait('@testForm');
  });

  specify('showing the form', function() {
    cy
      .get('.form__context-trail')
      .should('contain', 'Testin')
      .should('contain', 'Foo Form');

    cy
      .get('.action-sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.action-sidebar')
      .should('not.exist');

    cy
      .get('.js-sidebar-button')
      .should('not.have.class', 'is-selected')
      .click();

    cy
      .get('.action-sidebar');

    cy
      .get('.js-sidebar-button')
      .should('have.class', 'is-selected')
      .click();

    cy
      .get('.action-sidebar')
      .should('not.exist');
  });

  specify('routing to form', function() {
    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/test-form');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');
  });
});
