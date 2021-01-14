import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';

context('Patient Form', function() {
  specify('deleted action', function() {
    cy
      .server()
      .route({
        url: '/api/actions/1',
        status: 404,
        response: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find action',
            source: { parameter: 'actionId' },
          }],
        },
      })
      .as('routeAction')
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action you requested does not exist.');

    cy
      .url()
      .should('not.contain', 'patient-action/1/form/11111');
  });

  specify('showing the form', function() {
    let updatePrintStub;
    let historyPrintStub;

    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [
          { id: '2', meta: { created_at: testTsSubtract(1) } },
          { id: '1', meta: { created_at: testTs() } },
        ];

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction');

    // Cypress is unable to stub the contentWindow API in Firefox
    // https://github.com/cypress-io/cypress/issues/136#issuecomment-658574403
    if (!Cypress.isBrowser('firefox')) {
      cy
        .get('.form__update-region iframe')
        .then($iframe => {
          const contentWindow = $iframe[0].contentWindow;
          updatePrintStub = cy.stub(contentWindow, 'print');
        });
    }

    cy
      .get('.form__context-trail')
      .should('contain', 'Testin')
      .should('contain', 'Test Form');

    cy
      .get('.js-print-button')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Print Form');

    cy
      .get('.js-print-button')
      .trigger('mouseout');

    if (!Cypress.isBrowser('firefox')) {
      cy
        .get('.js-print-button')
        .click()
        .then(() => {
          expect(updatePrintStub).to.have.been.calledOnce;
        });
    }

    cy
      .get('.js-expand-button')
      .as('expandButton')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Increase Width');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click();

    cy
      .get('@expandButton')
      .find('.icon')
      .should('have.class', 'fa-compress-alt');

    cy
      .get('@expandButton')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Decrease Width');

    cy
      .get('@expandButton')
      .trigger('mouseout');


    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.js-history-button')
      .as('historyBtn')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'See Form Response History');

    cy
      .get('@historyBtn')
      .click();

    cy
      .get('@historyBtn')
      .click();

    cy
      .get('@historyBtn')
      .click();

    // Cypress is unable to stub the contentWindow API in Firefox
    // https://github.com/cypress-io/cypress/issues/136#issuecomment-658574403
    if (!Cypress.isBrowser('firefox')) {
      cy
        .get('.form__history-region iframe')
        .then($iframe => {
          const contentWindow = $iframe[0].contentWindow;
          historyPrintStub = cy.stub(contentWindow, 'print');
        });

      cy
        .get('.js-print-button')
        .click()
        .then(() => {
          expect(historyPrintStub).to.have.been.calledOnce;
        });
    }

    cy
      .get('.form__frame')
      .find('.form__action-bar')
      .as('metaRegion')
      .find('[data-versions-region]');

    cy
      .get('@historyBtn')
      .should('have.class', 'is-selected')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Back to Current Version');

    cy
      .get('@metaRegion')
      .find('.button-filter')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .should('have.length', 2)
      .last()
      .click();

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/response/2');

    cy
      .get('@metaRegion')
      .find('.js-current')
      .should('contain', 'Back to Current Version')
      .click();

    cy
      .route({
        url: '/api/actions/1',
        method: 'GET',
        status: 200,
        response() {
          return {
            data: {
              id: '1',
              type: 'patient-actions',
              attributes: {
                name: 'Foo',
              },
              relationships: {
                'form': {
                  'data': {
                    'id': '11111',
                  },
                },
                'form-responses': {
                  'data': [
                    { id: '3', meta: { created_at: testTs() } },
                    { id: '2', meta: { created_at: testTsSubtract(2) } },
                    { id: '1', meta: { created_at: testTsSubtract(1) } },
                  ],
                },
              },
            },
          };
        },
      })
      .as('routeAction2');

    cy
      .get('@historyBtn')
      .click()
      .wait('@routeAction2');

    cy
      .get('@metaRegion')
      .find('.button-filter')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .should('have.length', 3);

    cy
      .get('@metaRegion')
      .find('.js-current')
      .click();

    cy
      .get('@metaRegion')
      .find('.js-update')
      .click();

    cy
      .get('.js-sidebar-button')
      .as('sidebarButton')
      .should('not.have.class', 'is-selected')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Show Action Sidebar');

    cy
      .get('@sidebarButton')
      .trigger('mouseout')
      .click();

    cy
      .get('.sidebar')
      .find('[data-form-region]')
      .find('button')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('@sidebarButton')
      .should('not.have.class', 'is-selected');

    cy
      .get('@expandButton')
      .click();

    cy
      .get('.patient-sidebar')
      .should('not.exist');

    cy
      .get('@expandButton')
      .click();

    cy
      .get('.patient-sidebar');

    cy
      .get('@sidebarButton')
      .click();

    cy
      .get('.sidebar');

    cy
      .get('@sidebarButton')
      .should('have.class', 'is-selected')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('@sidebarButton')
      .should('not.have.class', 'is-selected')
      .click();

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/1',
        response: {},
      })
      .as('routeDeleteAction');

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action was deleted successfully.');

    cy
      .url()
      .should('not.contain', 'patient-action/1/form/11111');
  });

  specify('routing to form', function() {
    cy
      .server()
      .routeFlows()
      .routeActions(fx => {
        fx.data = _.sample(fx.data, 1);
        fx.data[0].id = '1';
        fx.data[0].relationships.form.data = { id: '11111' };
        return fx;
      })
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.patient.data = { id: '2' };
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [
          { id: '2', meta: { created_at: testTsSubtract(1) } },
          { id: '1', meta: { created_at: testTs() } },
        ];
        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';

        return fx;
      })
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .get('[data-toggle-region]')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .find('[data-form-region]')
      .click()
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/response/1');

    cy
      .get('.form__iframe')
      .should('contain', 'Last saved')
      .and('contain', formatDate(testTs(), 'AT_TIME'))
      .find('.js-update')
      .click();

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/new/2/1/1');

    cy
      .get('.form__iframe')
      .should('not.contain', 'Last saved');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', '/worklist/owned-by');
  });

  specify('routing to flow-action form', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.patient.data = { id: '1' };
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships.flow.data = { id: '1' };
        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('.js-history-button')
      .should('not.exist');

    cy
      .get('.form__iframe')
      .should('not.contain', 'Last saved');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/new/1/1');
  });

  specify('patient form without action', function() {
    let printStub;

    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/patient/1/form/11111')
      .wait('@routePatient');

    cy
      .get('.js-expand-button')
      .as('expandButton')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Increase Width');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click();

    cy
      .get('@expandButton')
      .find('.icon')
      .should('have.class', 'fa-compress-alt');

    cy
      .get('@expandButton')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Decrease Width');

    cy
      .get('@expandButton')
      .trigger('mouseout');


    cy
      .get('.sidebar')
      .should('not.exist');

    // Cypress is unable to stub the contentWindow API in Firefox
    // https://github.com/cypress-io/cypress/issues/136#issuecomment-658574403
    if (!Cypress.isBrowser('firefox')) {
      cy
        .get('[data-form-region] iframe')
        .then($iframe => {
          const contentWindow = $iframe[0].contentWindow;
          printStub = cy.stub(contentWindow, 'print');
        });

      cy
        .get('.js-print-button')
        .click()
        .then(() => {
          expect(printStub).to.have.been.calledOnce;
        });
    }
  });
});

context('Preview Form', function() {
  specify('routing to form', function() {
    cy
      .server()
      .routeFlows()
      .visit('/form/11111/preview');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/preview');

    cy
      .get('.form__context-trail')
      .should('contain', 'Test Form');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', '/worklist/owned-by');
  });
});
