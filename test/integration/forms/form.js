import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { getResource } from 'helpers/json-api';

context('Patient Action Form', function() {
  specify('deleted action', function() {
    cy
      .route({
        url: '/api/actions/1*',
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

  specify('directory', function() {
    cy
      .route({
        method: 'GET',
        url: '/appconfig.json',
        response: { versions: { frontend: 'foo' } },
      })
      .route({
        method: 'GET',
        url: '/api/directory/foo*',
        response: { data: { attributes: { value: ['one', 'two'] } } },
      })
      .as('routeDirectory')
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition(fx => {
        return {
          display: 'form',
          components: [
            {
              label: 'Select',
              widget: 'choicesjs',
              tableView: true,
              dataSrc: 'custom',
              data: {
                custom: 'values = getDirectory(\'foo\', { filter: { foo: \'bar\' }})',
              },
              template: '<span>{{ item }}</span>',
              refreshOn: 'data',
              key: 'select',
              type: 'select',
              input: true,
            },
          ],
        };
      })
      .routeFormActionFields()
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
      .wait('@routeForm')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeDirectory')
      .itsUrl()
      .should(({ search, pathname }) => {
        expect(search).to.contain('?filter[foo]=bar');
        expect(pathname).to.equal('/api/directory/foo');
      });

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .click();

    cy
      .iframe()
      .find('.choices__item--selectable')
      .first()
      .should('contain', 'one')
      .next()
      .should('contain', 'two');
  });

  specify('update a form', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };
        fx.data.relationships['form-responses'].data = [
          { id: '1', meta: { created_at: testTs() } },
        ];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields(fx => {
        delete fx.data.attributes;

        return fx;
      })
      .routeFormResponse(fx => {
        fx.data = {};

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeForm')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .get('.form__controls')
      .contains('Update')
      .click()
      .wait('@routeFormActionFields');

    cy
      .iframe();
  });

  specify('storing stored submission', function() {
    localStorage.clear();
    // Just short of 5MB to cause quota error
    localStorage.setItem('form-subm-too-big', _.times(5242800, _.constant('0')).join(''));
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeForm')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .type('bar');

    cy
      .wait(2100) // NOTE: must wait due to debounce in iframe
      .then(() => {
        expect(localStorage.getItem('form-subm-too-big')).to.be.null;

        const storage = JSON.parse(localStorage.getItem('form-subm-11111-1-11111-1'));

        expect(storage.submission.patient.fields.foo).to.equal('bar');
      });
  });

  specify('restoring stored submission', function() {
    localStorage.setItem('form-subm-11111-1-11111-1', JSON.stringify({
      updated: testTs(),
      submission: {
        patient: { fields: { foo: 'foo' } },
      },
    }));
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__content')
      .should('contain', `Data stored on ${ formatDate(testTs(), 'AT_TIME') }`)
      .find('.js-submit')
      .click();

    cy
      .wait('@routeForm')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'foo');
  });

  specify('discarding stored submission', function() {
    localStorage.setItem('form-subm-11111-1-11111-1', JSON.stringify({
      updated: testTs(),
      submission: {
        patient: { fields: { foo: 'foo' } },
      },
    }));
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };

        return fx;
      })
      .routeFormActionFields(fx => {
        fx.data.attributes = { patient: { fields: { foo: 'bar' } } };

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__content')
      .should('contain', `Data stored on ${ formatDate(testTs(), 'AT_TIME') }`)
      .find('.js-cancel')
      .click();

    cy
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormActionFields');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('prefill a form with latest submission', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };

        fx.data.attributes.tags = ['prefill-latest-response'];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction()
      .routeLatestFormResponseByPatient(fx => {
        fx.data.attributes = {
          response: {
            data: {
              familyHistory: 'Prefilled family history',
              storyTime: 'Prefilled story time',
              patient: { fields: { foo: 'bar' } },
            },
          },
        };

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeForm')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeLatestFormResponseByPatient');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('have.value', 'Prefilled family history');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('have.value', 'Prefilled story time');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('prefill a form with latest submission from another form', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '66666' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };

        fx.data.attributes.tags = ['prefill-latest-response'];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction()
      .routeLatestFormResponseByPatient(fx => {
        fx.data.attributes = {
          response: {
            data: {
              familyHistory: 'Prefilled family history',
              storyTime: 'Prefilled story time',
              patient: { fields: { foo: 'bar' } },
            },
          },
        };

        return fx;
      })
      .visit('/patient-action/1/form/66666')
      .wait('@routeAction')
      .wait('@routeForm')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormResponseByPatient')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[form]=11111');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('have.value', 'Prefilled family history');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('have.value', 'Prefilled story time');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('update a form with response field', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };
        fx.data.relationships['form-responses'].data = [
          { id: '1', meta: { created_at: testTs() } },
        ];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields(fx => {
        delete fx.data.attributes;

        return fx;
      })
      .routeFormResponse(fx => {
        fx.data = { patient: { fields: { foo: 'bar' } } };

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeForm')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar');

    cy
      .get('.form__controls')
      .contains('Update')
      .click()
      .wait('@routeFormActionFields');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('submitting the form', function() {
    let printStub;

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };
        fx.data.relationships['form-responses'].data = [
          { id: '2', meta: { created_at: testTsSubtract(1) } },
          { id: '1', meta: { created_at: testTs() } },
        ];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition(fx => {
        fx.components.push(
          {
            label: 'Survey',
            tableView: false,
            questions: [
              {
                label: '',
                value: '',
                tooltip: '',
              },
            ],
            values: [
              {
                label: '',
                value: '',
                tooltip: '',
              },
            ],
            key: 'fields.survey',
            type: 'survey',
            input: true,
          });
        return fx;
      })
      .routeFormActionFields()
      .routeFormResponse(fx => {
        fx.data.storyTime = 'Once upon a time...';

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.attributes.first_name = 'Testin';
        fx.data.attributes.last_name = 'Mctester';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeForm')
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
      .get('.form__title')
      .should('contain', 'Testin Mctester')
      .should('contain', 'Test Form');

    cy
      .get('.js-print-button')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Print Form');

    cy
      .get('.js-print-button')
      .trigger('mouseout');

    cy
      .get('.js-expand-button')
      .as('expandButton')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Decrease Width');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click();

    cy
      .get('@expandButton')
      .find('.icon')
      .should('have.class', 'fa-up-right-and-down-left-from-center');

    cy
      .get('@expandButton')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Decrease Width');

    cy
      .get('@expandButton')
      .trigger('mouseout');

    cy
      .get('.sidebar')
      .should('exist');

    cy
      .get('.js-history-button')
      .as('historyBtn')
      .trigger('pointerover');

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
      .should('not.exist');

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
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Back to Current Version');

    cy
      .get('@metaRegion')
      .find('.button-filter')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
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
      .wait('@routeFormActionFields');

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
        delay: 100,
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
        expect(data.attributes.response.data.survey).to.be.undefined;
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
      .should('have.class', 'is-selected')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Hide Action Sidebar');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click();

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
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '22222' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routePatient()
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction()
      .routeFormActionFields()
      .visit('/patient-action/1/form/22222')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeForm')
      .wait('@routeFormDefinition');

    cy
      .get('[data-status-region]')
      .should('not.contain', 'Your edits are not saved');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Read Only')
      .should('be.disabled');

    cy
      .get('.form-widgets')
      .should('not.exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]');
  });

  specify('form error', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeForm')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .route({
        status: 403,
        method: 'POST',
        delay: 100,
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
      .get('.form__content')
      .should('not.contain', 'Last saved');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/');
  });

  specify('store expanded state in localStorage', function() {
    localStorage.setItem('form-state_11111', JSON.stringify({ isExpanded: false }));

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '22222' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction()
      .routeFormActionFields()
      .visit('/patient-action/1/form/22222')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeForm')
      .wait('@routeFormDefinition');

    cy
      .get('.sidebar')
      .should('exist');

    cy
      .get('.js-sidebar-button')
      .as('sidebarButton')
      .should('have.class', 'is-selected')
      .trigger('mouseover');

    cy
      .get('.js-expand-button')
      .as('expandButton')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Increase Width');

    cy
      .get('@expandButton')
      .find('.icon')
      .should('have.class', 'fa-up-right-and-down-left-from-center');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-state_11111'));

        expect(storage.isExpanded).to.be.true;
      });

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-state_11111'));

        expect(storage.isExpanded).to.be.false;
      });
  });

  specify('form header widgets', function() {
    const dob = testDateSubtract(10, 'years');

    cy
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeActionActivity()
      .routeFormActionFields()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '55555' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeWidgets(fx => {
        const newWidget = getResource({
          id: 'testFieldWidget',
          widget_type: 'fieldWidget',
          definition: {
            display_name: 'Test Field',
            field_name: 'testField',
          },
        }, 'widgets');

        fx.data.push(newWidget);

        return fx;
      })
      .routePatientByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes = {
          first_name: 'First',
          last_name: 'Last',
          birth_date: dob,
          sex: 'f',
          status: 'active',
        };

        fx.data.relationships['patient-fields'].data = [{ id: '1', type: 'patient-fields' }];

        return fx;
      })
      .routePatientField(fx => {
        fx.data = {
          id: '1',
          type: 'patient-fields',
          attributes: {
            name: 'testField',
            value: 'Test field widget',
          },
        };

        return fx;
      }, 'testField');

    cy
      .visit('/patient-action/1/form/55555')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routePatientByAction')
      .wait('@routeAction')
      .wait('@routeWidgets')
      .wait('@routePatientFieldtestField');

    cy
      .get('.form-widgets')
      .find('.form-widgets__section')
      .first()
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ dayjs(testDate()).diff(dob, 'years') }`)
      .next()
      .should('contain', 'Sex')
      .should('contain', 'Female')
      .next()
      .should('contain', 'Status')
      .should('contain', 'Active')
      .next()
      .should('contain', 'Test Field')
      .should('contain', 'Test field widget');
  });
});

context('Patient Form', function() {
  specify('submitting the form', function() {
    let printStub;

    cy
      .routeForm(_.identity, '11111')
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
      .wait('@routeForm')
      .wait('@routePatient')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/');

    cy
      .get('.js-expand-button')
      .as('expandButton')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Decrease Width');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click();

    cy
      .get('@expandButton')
      .find('.icon')
      .should('have.class', 'fa-up-right-and-down-left-from-center');

    cy
      .get('@expandButton')
      .trigger('pointerover');

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
        delay: 100,
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

  specify('restoring stored submission', function() {
    localStorage.setItem('form-subm-11111-1-11111', JSON.stringify({
      updated: testTs(),
      submission: {
        patient: { fields: { foo: 'foo' } },
      },
    }));
    cy
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/patient/1/form/11111')
      .wait('@routePatient');

    cy
      .get('.form__content')
      .should('contain', `Data stored on ${ formatDate(testTs(), 'AT_TIME') }`)
      .find('.js-submit')
      .click();

    cy
      .wait('@routeForm')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'foo');
  });

  specify('discarding stored submission', function() {
    localStorage.setItem('form-subm-11111-1-11111', JSON.stringify({
      updated: testTs(),
      submission: {
        patient: { fields: { foo: 'foo' } },
      },
    }));
    cy
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeFormFields(fx => {
        fx.data.attributes = { patient: { fields: { foo: 'bar' } } };

        return fx;
      })
      .visit('/patient/1/form/11111')
      .wait('@routePatient');

    cy
      .get('.form__content')
      .should('contain', `Data stored on ${ formatDate(testTs(), 'AT_TIME') }`)
      .find('.js-cancel')
      .click();

    cy
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar');
  });


  specify('read only form', function() {
    cy
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormFields()
      .visit('/patient/1/form/22222')
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .get('[data-status-region]')
      .should('not.contain', 'Your edits are not saved');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Read Only')
      .should('be.disabled');

    cy
      .get('.form-widgets')
      .should('not.exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]');
  });

  specify('form scripts and reducers', function() {
    cy
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormFields()
      .visit('/patient/1/form/33333')
      .wait('@routeForm')
      .wait('@routePatient')
      .wait('@routeFormFields')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('contain', 'foo');
  });

  if (Cypress.browser.name !== 'firefox') {
    specify('form reducer error', function() {
      cy
        .routePatient(fx => {
          fx.data.id = '1';
          return fx;
        })
        .routeForm(_.identity, '11111')
        .routeFormDefinition()
        .routeFormFields()
        .visit('/patient/1/form/44444')
        .wait('@routePatient')
        .wait('@routeForm')
        .wait('@routeFormFields')
        .wait('@routeFormDefinition');

      cy
        .get('iframe')
        .its('0.contentWindow')
        .should('not.be.empty')
        .then(win => {
          cy
            .stub(win.console, 'error')
            .as('consoleError');

          cy
            .get('@consoleError')
            .should('be.calledOnce');
        });
    });
  }

  specify('form error', function() {
    cy
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormFields()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/patient/1/form/11111')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields')
      .wait('@routePatient');

    cy
      .route({
        status: 403,
        method: 'POST',
        delay: 100,
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

  specify('store expanded state in localStorage', function() {
    localStorage.setItem('form-state_11111', JSON.stringify({ isExpanded: false }));

    cy
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormFields()
      .visit('/patient/1/form/22222')
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .get('.form__sidebar')
      .should('exist');

    cy
      .get('.js-expand-button')
      .as('expandButton')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Increase Width');

    cy
      .get('@expandButton')
      .find('.icon')
      .should('have.class', 'fa-up-right-and-down-left-from-center');

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-state_11111'));

        expect(storage.isExpanded).to.be.true;
      });

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-state_11111'));

        expect(storage.isExpanded).to.be.false;
      });
  });

  specify('form header widgets', function() {
    const dob = testDateSubtract(10, 'years');

    cy
      .routeForm(_.identity, '11111')
      .routeFormDefinition()
      .routeFormFields()
      .routeWidgets(fx => {
        const newWidget = getResource({
          id: 'testFieldWidget',
          widget_type: 'fieldWidget',
          definition: {
            display_name: 'Test Field',
            field_name: 'testField',
          },
        }, 'widgets');

        fx.data.push(newWidget);

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes = {
          first_name: 'First',
          last_name: 'Last',
          birth_date: dob,
          sex: 'f',
          status: 'active',
        };

        fx.data.relationships['patient-fields'].data = [{ id: '1', type: 'patient-fields' }];

        return fx;
      })
      .routePatientField(fx => {
        fx.data = {
          id: '1',
          type: 'patient-fields',
          attributes: {
            name: 'testField',
            value: 'Test field widget',
          },
        };

        return fx;
      }, 'testField');

    cy
      .visit('/patient/1/form/55555')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields')
      .wait('@routeWidgets')
      .wait('@routePatient')
      .wait('@routePatientFieldtestField');

    cy
      .get('.form-widgets')
      .find('.form-widgets__section')
      .first()
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ dayjs(testDate()).diff(dob, 'years') }`)
      .next()
      .should('contain', 'Sex')
      .should('contain', 'Female')
      .next()
      .should('contain', 'Status')
      .should('contain', 'Active')
      .next()
      .should('contain', 'Test Field')
      .should('contain', 'Test field widget');
  });
});

context('Preview Form', function() {
  specify('routing to form', function() {
    cy
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
