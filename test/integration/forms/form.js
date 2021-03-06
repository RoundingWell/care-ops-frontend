import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testDate } from 'helpers/test-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';

context('Patient Action Form', function() {
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

  specify('submitting the form', function() {
    let printStub;

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
      .routeFormDefinition()
      .routeFormFields()
      .routeFormResponse(fx => {
        fx.data.storyTime = 'Once upon a time...';

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .should('contain', 'Family Medical History');

    cy
      .get('@iframe')
      .should('contain', 'Here is some typing');

    cy
      .get('@iframe')
      .find('textarea')
      .should('not.exist');

    cy
      .get('@iframe')
      .find('button')
      .should('not.be.visible');

    cy
      .get('iframe')
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

    cy
      .get('.form__context-trail')
      .should('contain', 'Testin');

    cy
      .get('.form__title')
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
      .get('@expandButton')
      .click();

    cy
      .get('.sidebar')
      .should('exist');

    cy
      .get('@expandButton')
      .click();

    cy
      .get('@historyBtn')
      .click();

    cy
      .get('@historyBtn')
      .click();

    cy
      .get('.form__controls')
      .as('metaRegion');

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
      .should('have.attr', 'src', '/formapp/2');

    cy
      .get('@metaRegion')
      .find('.js-current')
      .should('contain', 'Back to Current Version')
      .click();

    cy
      .get('@metaRegion')
      .find('button')
      .contains('Update')
      .click()
      .wait('@routeFormFields');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .find('textarea[name="data[familyHistory]"]')
      .clear()
      .type('New typing');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/form-responses',
        response: { data: { id: '12345' } },
      })
      .as('routePostResponse');

    cy
      .get('@metaRegion')
      .find('button')
      .contains('Save')
      .click();

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action.data.id).to.equal('1');
        expect(data.relationships.form.data.id).to.equal('11111');
        expect(data.attributes.response.data.familyHistory).to.equal('New typing');
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.first_name).to.equal('John');
        expect(data.attributes.response.data.patient.last_name).to.equal('Doe');
        expect(data.attributes.response.data.patient.fields.foo).to.equal('bar');
        expect(data.attributes.response.data.patient.fields.weight).to.equal(192);
      });

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/12345');

    cy
      .wait('@routeFormResponse');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Update')
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

  specify('read only form', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '22222' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeFormDefinition()
      .routeFormFields()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/22222')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .get('[data-status-region]')
      .should('not.contain', 'Not Saved');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Read Only')
      .should('be.disabled');
  });

  specify('form error', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeFormDefinition()
      .routeFormFields()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .route({
        status: 403,
        method: 'POST',
        url: '/api/form-responses',
        response: {
          errors: [
            {
              id: '1',
              status: 403,
              title: 'Forbidden',
              detail: 'Insufficient permissions',
            },
          ],
        },
      })
      .as('postFormResponse');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .find('textarea[name="data[familyHistory]"]')
      .clear()
      .type('New typing');

    cy
      .get('@iframe')
      .find('textarea[name="data[storyTime]"]')
      .clear()
      .type('New typing');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Save')
      .click()
      .wait('@postFormResponse');

    cy
      .get('@iframe')
      .find('.alert')
      .contains('Insufficient permissions');
  });

  specify('routing to form-response', function() {
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
      .should('have.attr', 'src', '/formapp/1');

    cy
      .get('.form__frame')
      .should('contain', 'Last saved')
      .and('contain', formatDate(testTs(), 'AT_TIME'))
      .find('button')
      .contains('Update')
      .click();

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', '/worklist/owned-by');

    cy
      .go('back');
  });

  specify('routing to form', function() {
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
      .should('have.attr', 'src', '/formapp/');
  });
});

context('Patient Form', function() {
  specify('submitting the form', function() {
    let printStub;

    cy
      .server()
      .routeFormDefinition()
      .routeFormFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .routeFormResponse()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/patient/1/form/11111')
      .wait('@routePatient')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/');

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
      .get('iframe')
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

    cy
      .get('@routeFormFields')
      .its('url')
      .should('include', 'filter[cleared]=false');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .should('contain', 'Family Medical History');

    cy
      .get('@iframe')
      .find('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .get('@iframe')
      .find('textarea[name="data[storyTime]"]')
      .should('have.value', 'Once upon a time...');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/form-responses',
        response: { data: { id: '12345' } },
      })
      .as('routePostResponse');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Save')
      .click();

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action).to.be.undefined;
        expect(data.relationships.form.data.id).to.equal('11111');
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.first_name).to.equal('John');
        expect(data.attributes.response.data.patient.last_name).to.equal('Doe');
        expect(data.attributes.response.data.patient.fields.weight).to.equal(192);
      });

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/12345');

    cy
      .wait('@routeFormResponse');

    cy
      .get('.form__context-trail')
      .find('.js-dashboard')
      .click();

    cy
      .url()
      .should('contain', '/dashboard/1');

    cy
      .go('back');
  });

  specify('read only form', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeFormDefinition()
      .routeFormFields()
      .visit('/patient/1/form/22222')
      .wait('@routePatient')
      .wait('@routeFormFields')
      .wait('@routeFormDefinition');

    cy
      .get('[data-status-region]')
      .should('not.contain', 'Not Saved');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Read Only')
      .should('be.disabled');
  });

  specify('form error', function() {
    cy
      .server()
      .routeFormDefinition()
      .routeFormFields()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/patient/1/form/11111')
      .wait('@routePatient')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .route({
        status: 403,
        method: 'POST',
        url: '/api/form-responses',
        response: {
          errors: [
            {
              id: '1',
              status: 403,
              title: 'Forbidden',
              detail: 'Insufficient permissions',
            },
          ],
        },
      })
      .as('postFormResponse');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .find('textarea[name="data[familyHistory]"]')
      .clear()
      .type('New typing');

    cy
      .get('@iframe')
      .find('textarea[name="data[storyTime]"]')
      .clear()
      .type('New typing');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Save')
      .click()
      .wait('@postFormResponse');

    cy
      .get('@iframe')
      .find('.alert')
      .contains('Insufficient permissions');
  });
});

context('Preview Form', function() {
  specify('routing to form', function() {
    cy
      .server()
      .fixture('test/form-kitchen-sink.json').as('fxTestFormKitchenSink')
      .routeFlows()
      .route({
        url: '/api/forms/*/definition',
        response() {
          return this.fxTestFormKitchenSink;
        },
      })
      .as('routeFormKitchenSink')
      .visit('/form/11111/preview')
      // NOTE: https://github.com/formio/formio.js/issues/3489
      // Issue started at v4.12.rc-1
      .wait(500);

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/preview');

    cy
      .iframe()
      .as('iframe')
      .wait('@routeFormKitchenSink');

    cy
      .get('@iframe')
      .find('.formio-component')
      .as('formIOComponent')
      .find('input[type=text]')
      .first()
      .type('hello')
      .should('have.value', 'hello');

    cy
      .get('@formIOComponent')
      .find('input[type=checkbox]')
      .first()
      .click()
      .should('be.checked');

    cy
      .get('@formIOComponent')
      .find('input[type=radio]')
      .first()
      .click()
      .should('be.checked');

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__input--cloned')
      .first()
      .type('item 1{enter}item 2{enter}');

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__item')
      .first()
      .should('contain', 'item 1')
      .next()
      .should('contain', 'item 2')
      .find('button')
      .click();

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__inner .choices__item')
      .should('have.length', 1);

    cy
      .get('@formIOComponent')
      .find('.formio-component-datetime .input-group')
      .click();

    cy
      .get('@iframe')
      .find('.flatpickr-calendar')
      .find('.flatpickr-day.today')
      .click('center');

    cy
      .get('@formIOComponent')
      .find('.formio-component-datetime input[type=text]')
      .should('have.value', `${ testDate() } 12:00 PM`);

    cy
      .get('.form__title')
      .should('contain', 'Test Form');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', '/worklist/owned-by');

    cy
      .go('back');
  });
});
