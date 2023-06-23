import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { getResource } from 'helpers/json-api';

context('Patient Action Form', function() {
  beforeEach(function() {
    cy.routesForDefault();
  });

  specify('deleted action', function() {
    cy
      .intercept('GET', '/api/actions/1*', {
        statusCode: 404,
        body: {
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
      .routeFormByAction(_.identity, '11111')
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
      .routeFormByAction(_.identity, '11111')
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
      .wait('@routeFormByAction')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .get('[data-form-updated-region]')
      .should('be.empty');

    cy
      .get('.form__controls')
      .contains('Update')
      .click()
      .wait('@routeFormActionFields');

    cy
      .iframe();
  });

  specify('storing stored submission', function() {
    const currentTs = dayjs.utc();

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routePatientByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy.clock(currentTs);

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .type('bar');

    cy
      .wait(300) // NOTE: must wait due to debounce in iframe
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-subm-11111-1-11111-1'));

        expect(storage.submission.patient.fields.foo).to.equal('bar');
      });

    cy
      .get('.form__controls')
      .find('.form__last-updated-text')
      .should('contain', `Last edit was ${ formatDate(dayjs(currentTs).format(), 'AGO_OR_TODAY') }`);

    cy.tick(45000);

    cy
      .get('.form__controls')
      .find('.form__last-updated-text')
      .should('contain', `Last edit was ${ formatDate(dayjs(currentTs).subtract(45, 'seconds').format(), 'AGO_OR_TODAY') }`);

    cy
      .clock()
      .invoke('restore');
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
      .routeFormByAction(_.identity, '11111')
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
      .get('.form__controls')
      .find('.form__last-updated')
      .should('contain', `Last edit was ${ formatDate(testTs(), 'AGO_OR_TODAY') }`);

    cy
      .get('.form__content')
      .should('contain', `Last edit was ${ formatDate(testTs(), 'TIME_OR_DAY') }`)
      .find('.js-submit')
      .click();

    cy
      .wait('@routeFormByAction')
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
      .routeFormByAction(_.identity, '11111')
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
      .get('.form__controls')
      .find('.form__last-updated')
      .should('contain', 'Your work is stored automatically.')
      .should('contain', `Last edit was ${ formatDate(testTs(), 'AGO_OR_TODAY') }`);

    cy
      .get('.form__content')
      .should('contain', `Last edit was ${ formatDate(testTs(), 'TIME_OR_DAY') }`)
      .find('.js-discard')
      .click();

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click();

    cy
      .wait('@routeFormByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormActionFields');

    cy
      .get('.form__controls')
      .find('.form__last-updated')
      .should('contain', 'Your work is stored automatically.')
      .should('not.contain', `Last edit was ${ formatDate(testTs(), 'AGO_OR_TODAY') }`);

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
      .routeFormByAction(_.identity, '11111')
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
      .wait('@routeFormByAction')
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

  specify('prefill a form with latest submission by flow', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };
        fx.data.relationships.flow = { data: { id: '1' } };

        fx.data.attributes.tags = ['prefill-flow-response'];

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
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
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormResponseByPatient')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[form]=11111')
      .should('contain', 'filter[flow]=1');

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
        fx.data.relationships.flow = { data: { id: '1' } };

        fx.data.attributes.tags = ['prefill-latest-response'];

        return fx;
      })
      .routeFormByAction(_.identity, '66666')
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
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormResponseByPatient')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[form]=11111')
      .should('not.contain', 'filter[flow]');

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

  specify('prefill a form with latest submission from action tag', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '77777' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };
        fx.data.relationships.flow = { data: { id: '1' } };

        fx.data.attributes.tags = ['prefill-latest-response'];

        return fx;
      })
      .routeFormByAction(_.identity, '77777')
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
      .visit('/patient-action/1/form/77777')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormResponseByPatient')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[action.tags]=foo-tag')
      .should('not.contain', 'filter[flow]')
      .should('not.contain', 'filter[form]');

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
      .routeFormByAction(_.identity, '11111')
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
      .wait('@routeFormByAction')
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
    cy
      .routesForPatientAction()
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
      .routeFormByAction(_.identity, '11111')
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
      .routeFormActionFields(fx => {
        fx.data.attributes.fields.survey = [];
        return fx;
      })
      .routeFormResponse(fx => {
        fx.data.storyTime = 'Once upon a time...';

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Testin';
        fx.data.attributes.last_name = 'Mctester';

        return fx;
      })
      .routePatientField()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
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
      .get('.form__title')
      .should('contain', 'Testin Mctester')
      .should('contain', 'Test Form');

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
      .should('contain', 'Increase Width');

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
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        delay: 100,
        body: { data: { id: '12345' } },
      })
      .as('routePostResponse');

    cy
      .get('@metaRegion')
      .find('button')
      .contains('Submit')
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
        expect(data.attributes.response.data.fields.survey).to.eql([]);
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
      .intercept('DELETE', '/api/actions/1', {
        statusCode: 204,
        body: {},
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

  specify('action locked form', function() {
    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.locked_at = testTs();
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [
          { id: '1', meta: { created_at: testTs() } },
        ];
        return fx;
      })
      .routeFormByAction()
      .routeFormDefinition()
      .routeFormResponse(fx => {
        fx.data = { patient: { fields: { foo: 'bar' } } };

        return fx;
      })
      .visit('/patient-action/1/form/22222')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routeFormResponse')
      .wait('@routeFormDefinition');

    cy
      .get('[data-form-updated-region]')
      .should('be.empty');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Read Only')
      .should('be.disabled');

    cy
      .iframe()
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');

    cy
      .get('.form__frame')
      .should('contain', 'Last submitted')
      .and('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.js-history-button')
      .click();

    // NOTE: History functionality tested elsewhere
    cy
      .get('.js-current')
      .should('exist');
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
      .routeFormByAction(_.identity, '22222')
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction()
      .routeFormActionFields(fx => {
        fx.data.attributes = { patient: { fields: { foo: 'bar' } } };

        return fx;
      })
      .visit('/patient-action/1/form/22222')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormActionFields');

    cy
      .get('[data-form-updated-region]')
      .should('be.empty');

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
      .find('[name="data[patient.fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');
  });

  specify('routing to form-response', function() {
    cy
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
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormResponse()
      .visit('/worklist/owned-by')
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
      .should('contain', 'Last submitted')
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
      .routesForPatientDashboard()
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
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormResponse()
      .routeFormActionFields()
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
      .should('not.contain', 'Last submitted');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', '/patient/dashboard/1');
  });

  specify('store expanded state in localStorage', function() {
    localStorage.setItem('form-state_11111', JSON.stringify({ isExpanded: false }));

    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '22222' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeFormByAction(_.identity, '22222')
      .routeFormDefinition()
      .routeFormActionFields()
      .visit('/patient-action/1/form/22222')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormByAction')
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
      .routeFormByAction(_.identity, '55555')
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
      .wait('@routeFormByAction')
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

  specify('submit and go back button', function() {
    localStorage.setItem('form-state_11111', JSON.stringify({ saveButtonType: 'saveAndGoBack' }));

    cy
      .routesForPatientDashboard()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships['program-action'] = { data: { id: '11111' } };

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        delay: 100,
        body: { data: { id: '12345' } },
      })
      .as('routePostResponse');

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .should('not.be.disabled')
      .should('contain', 'Submit + Go Back');

    cy
      .get('.form__controls')
      .find('.button__drop-list-select')
      .should('not.be.disabled')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('have.length', 2)
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-state_11111'));

        expect(storage.saveButtonType).to.equal('save');
      });

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .should('contain', 'Submit')
      .should('not.contain', 'Go Back');

    cy
      .get('.form__controls')
      .find('.button__drop-list-select')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('have.length', 2)
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-state_11111'));

        expect(storage.saveButtonType).to.equal('saveAndGoBack');
      });

    cy
      .get('.form__controls')
      .find('.button__drop-list-select')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('have.length', 2);

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .get('.picklist')
      .should('not.exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .type('Once upon a time...');

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .click();

    cy
      .get('.fill-window--dark.is-shown')
      .should('contain', 'Submitting your work...');

    cy
      .get('.app-frame__content')
      .click('left', { force: true });

    cy
      .get('.fill-window--dark.is-shown')
      .should('exist');

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .should('be.disabled');

    cy
      .get('.form__controls')
      .find('.button__drop-list-select')
      .should('be.disabled');

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action.data.id).to.equal('1');
        expect(data.relationships.form.data.id).to.equal('11111');
        expect(data.attributes.response.data.familyHistory).to.equal('Here is some typing');
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.fields.weight).to.equal(192);
      });

    cy
      .url()
      .should('contain', 'patient/dashboard/1');
  });

  specify('submit and go back button - form response error', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 403,
        delay: 100,
        body: {
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
      .find('.button__drop-list-select')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .eq(1)
      .click();

    cy
      .get('.form__controls')
      .find('button')
      .contains('Submit')
      .click()
      .wait('@postFormResponse');

    cy
      .get('@iframe')
      .find('.alert')
      .contains('Insufficient permissions');
  });

  specify('form error', function() {
    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };
        fx.data.relationships['form-responses'].data = [];

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 403,
        delay: 100,
        body: {
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
      .contains('Submit')
      .click()
      .wait('@postFormResponse');

    cy
      .get('@iframe')
      .find('.alert')
      .contains('Insufficient permissions');
  });

  specify('hidden submit button', function() {
    cy
      .routeAction()
      .routeFormByAction(_.identity, '88888')
      .routeFormDefinition()
      .routeFormActionFields()
      .routePatientByAction()
      .visit('/patient-action/1/form/88888')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Submit')
      .should('not.exist');
  });

  specify('hidden submit button - update form', function() {
    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships['form-responses'].data = [
          { id: '1', meta: { created_at: testTs() } },
        ];

        return fx;
      })
      .routeFormByAction(_.identity, '88888')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeFormResponse(fx => {
        fx.data = {};

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/88888')
      .wait('@routeFormByAction')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Update')
      .click();

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Submit')
      .should('not.exist');
  });
});
