import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { getRelationship, getErrors } from 'helpers/json-api';

import { getAction } from 'support/api/actions';
import { getCurrentClinician, getClinician } from 'support/api/clinicians';
import { getFormFields } from 'support/api/form-fields';
import { getFormResponse } from 'support/api/form-responses';
import { getPatient } from 'support/api/patients';
import { getPatientField } from 'support/api/patient-fields';
import { getWidget } from 'support/api/widgets';

import { roleNoFilterEmployee, roleTeamEmployee } from 'support/api/roles';
import { stateTodo, stateInProgress } from 'support/api/states';
import { teamCoordinator, teamNurse } from 'support/api/teams';

import { FORM_RESPONSE_STATUS } from 'js/static';

context('Patient Action Form', function() {
  beforeEach(function() {
    cy
      .routeWorkspacePatient()
      .routesForDefault();
  });

  specify('deleted action', function() {
    const errors = getErrors({
      status: '410',
      title: 'Not Found',
      detail: 'Cannot find action',
    });

    cy
      .intercept('GET', '/api/actions/*', {
        statusCode: 410,
        body: { errors },
      })
      .as('routeActionError')
      .routePatientByAction()
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .visit('/patient-action/1/form/11111')
      .wait('@routePatientByAction')
      .wait('@routeActionError');

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
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([{ id: '11111' }], 'form-responses'),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeFormByAction')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

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
    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([]),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routePatientByAction(fx => {
        fx.data = getPatient({ id: '1' });

        return fx;
      })
      .visitOnClock('/patient-action/1/form/11111', { now: testTs() })
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        body: { data: getFormResponse() },
      })
      .as('routePostResponse');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .type('bar');

    cy
      .wait(300) // NOTE: must wait due to debounce in iframe
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('form-subm-11111-1-11111-1'));

        expect(storage.submission.fields.foo).to.equal('bar');
      });

    cy
      .get('.form__controls')
      .find('.form__submit-status-text')
      .should('contain', 'Last edit was a few seconds ago');

    cy
      .tick(15000);

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.status).to.equal('draft');
      });

    cy
      .tick(45000);

    cy
      .get('.form__controls')
      .find('.form__submit-status-text')
      .should('contain', 'Last edit was a minute ago');
  });

  specify('restoring stored submission', function() {
    localStorage.setItem('form-subm-11111-1-11111-1', JSON.stringify({
      updated: testTs(),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse(() => {
        return {
          data: getFormResponse({
            id: '1',
            attributes: {
              status: FORM_RESPONSE_STATUS.DRAFT,
              updated_at: testTsSubtract(1),
              response: {
                data: {
                  fields: { foo: 'bar' },
                },
              },
            },
          }),
        };
      })
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = getPatient({ id: '1' });

        return fx;
      })
      .visitOnClock('/patient-action/1/form/11111', { now: testTs() })
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'Last edit was a few seconds ago');

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
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'foo');
  });

  specify('restoring a draft', function() {
    localStorage.setItem('form-subm-11111-1-11111-1', JSON.stringify({
      updated: testTsSubtract(1),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    const formResponse = getFormResponse({
      attributes: {
        status: FORM_RESPONSE_STATUS.DRAFT,
        updated_at: testTs(),
        response: {
          data: { fields: { foo: 'bar' } },
        },
      },
    });

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([formResponse]),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse(() => {
        return {
          data: formResponse,
        };
      })
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = getPatient({ id: '1' });

        return fx;
      })
      .visitOnClock('/patient-action/1/form/11111', { now: testTs() })
      .wait('@routeAction')
      .wait('@routePatientByAction');

    cy
      .intercept('PATCH', `/api/form-responses/${ formResponse.id }`, {
        statusCode: 201,
        body: { data: getFormResponse({ id: formResponse.id }) },
      })
      .as('routePatchResponse');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'Last edit was a few seconds ago');

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
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .type('baz');

    cy
      .wait(300); // NOTE: must wait due to debounce in iframe

    cy
      .get('.form__controls')
      .find('.form__submit-status-text')
      .should('contain', 'Last edit was a few seconds ago');

    cy
      .tick(15000);

    cy
      .wait('@routePatchResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.equal(formResponse.id);
        expect(data.attributes.status).to.equal('draft');
      });
  });

  specify('discarding stored submission', function() {
    localStorage.setItem('form-subm-11111-1-11111-1', JSON.stringify({
      updated: testTs(),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    const formResponse = getFormResponse({
      attributes: {
        status: FORM_RESPONSE_STATUS.DRAFT,
        updated_at: testTsSubtract(1),
        response: {
          data: { fields: { foo: 'bazinga' } },
        },
      },
    });

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([formResponse]),
          },
        });

        return fx;
      })
      .routeFormActionFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: { foo: 'bar' },
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse(() => {
        return {
          data: formResponse,
        };
      })
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = getPatient({ id: '1' });

        return fx;
      })
      .visitOnClock('/patient-action/1/form/11111', { now: testTs() })
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeLatestFormResponse');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        body: { data: getFormResponse({ id: '12345' }) },
      })
      .as('routePostResponse');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'Your work is stored automatically.')
      .should('contain', 'Last edit was a few seconds ago');

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
      .find('.form__submit-status')
      .should('contain', 'Your work is stored automatically.')
      .should('not.contain', 'Last edit was');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .type('baz');

    cy
      .wait(300); // NOTE: must wait due to debounce in iframe

    cy
      .get('.form__controls')
      .find('.form__submit-status-text')
      .should('contain', 'Last edit was a few seconds ago');

    cy
      .tick(15000);

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.not.equal('1');
        expect(data.attributes.status).to.equal('draft');
      });
  });

  specify('prefill a form with latest submission by flow', function() {
    const patient = getPatient({ id: '1' });

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          attributes: {
            tags: ['prefill-flow-response'],
          },
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'flow': getRelationship('1', 'flows'),
            'patient': getRelationship(patient),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = patient;

        return fx;
      })
      .routeLatestFormSubmission(fx => {
        fx.data = getFormResponse({
          attributes: {
            status: FORM_RESPONSE_STATUS.SUBMITTED,
            response: {
              data: {
                familyHistory: 'Prefilled family history',
                storyTime: 'Prefilled story time',
                fields: { foo: 'bar' },
              },
            },
          },
        });

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormSubmission')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[patient]=1')
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
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('prefill a form with latest submission from another form', function() {
    const patient = getPatient({ id: '1' });

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          attributes: {
            tags: ['prefill-latest-response'],
          },
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'flow': getRelationship('1', 'flows'),
            'patient': getRelationship(patient),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '66666')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = patient;
        return fx;
      })
      .routeLatestFormSubmission(fx => {
        fx.data = getFormResponse({
          attributes: {
            status: FORM_RESPONSE_STATUS.SUBMITTED,
            response: {
              data: {
                familyHistory: 'Prefilled family history',
                storyTime: 'Prefilled story time',
                fields: { foo: 'bar' },
              },
            },
          },
        });

        return fx;
      })
      .visit('/patient-action/1/form/66666')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormSubmission')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[patient]=1')
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
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('prefill a form with latest submission from action tag', function() {
    const patient = getPatient({ id: '1' });

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          attributes: {
            tags: ['prefill-latest-response'],
          },
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'flow': getRelationship('1', 'flows'),
            'patient': getRelationship(patient),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '77777')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = patient;

        return fx;
      })
      .routeLatestFormSubmission(fx => {
        fx.data = getFormResponse({
          attributes: {
            status: FORM_RESPONSE_STATUS.SUBMITTED,
            response: {
              data: {
                familyHistory: 'Prefilled family history',
                fields: { foo: 'bar' },
              },
              flow: { storyTime: 'Prefilled response story time' },
            },
          },
        });

        return fx;
      })
      .visit('/patient-action/1/form/77777')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeLatestFormSubmission')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[patient]=1')
      .should('contain', 'filter[action.tags]=foo-tag')
      .should('not.contain', 'filter[created]')
      .should('not.contain', 'filter[flow]')
      .should('not.contain', 'filter[form]');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('have.value', 'Prefilled family history');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('have.value', 'Prefilled response story time');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('update a form with response field', function() {
    const formResponse = getFormResponse({
      attributes: {
        updated_at: testTs(),
        status: FORM_RESPONSE_STATUS.SUBMITTED,
        response: { data: { fields: { foo: 'bar' } } },
      },
    });

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([formResponse]),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeFormResponse(fx => {
        fx.data = formResponse;

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');

    cy
      .get('.form__controls')
      .contains('Update')
      .click()
      .wait('@routeFormActionFields');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('submitting the form', function() {
    const formResponses = [
      getFormResponse({
        id: '1',
        attributes: {
          updated_at: testTs(),
          status: FORM_RESPONSE_STATUS.SUBMITTED,
          response: {
            data: {
              familyHistory: 'Here is some typing',
              storyTime: 'Once upon a time...',
            },
          },
        },
      }),
      getFormResponse({
        id: '2',
        attributes: {
          updated_at: testTs(),
          status: FORM_RESPONSE_STATUS.SUBMITTED,
          response: { data: { fields: { foo: 'bar' } } },
        },
      }),
    ];

    const testPatient = getPatient({
      attributes: {
        first_name: 'Testin',
        last_name: 'Mctester',
      },
    });

    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'flow': getRelationship(),
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([...formResponses, { id: '111111' }]),
            'patient': getRelationship(testPatient),
          },
        });

        fx.included.push(...formResponses);

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
        fx.data = getFormFields({
          attributes: {
            fields: {
              foo: 'bar',
              survey: [],
            },
          },
        });

        return fx;
      })
      .routeFormResponse(fx => {
        fx.data = formResponses[0];

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data = testPatient;

        return fx;
      })
      .routePatientField()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition')
      .wait('@routeWorkspacePatient')
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
      .click()
      .wait('@routeActionActivity')
      .wait('@routePatientField')
      .wait('@routeWorkspacePatient')
      .wait('@routeActionComments')
      .wait('@routeActionFiles');

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
        body: { data: getFormResponse({ id: '12345' }) },
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
        expect(data.attributes.response.data.fields.foo).to.equal('bar');
        expect(data.attributes.response.data.fields.survey).to.eql([]);
        expect(data.attributes.response.fields.survey).to.eql([]);
        expect(data.attributes.response.flow).to.be.undefined;
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
    const formResponse = getFormResponse({
      attributes: {
        updated_at: testTs(),
        status: FORM_RESPONSE_STATUS.SUBMITTED,
        response: { data: { fields: { foo: 'bar' } } },
      },
    });

    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          attributes: {
            locked_at: testTs(),
          },
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'state': getRelationship(stateInProgress),
            'form-responses': getRelationship([formResponse], 'form-responses'),
          },
        });

        return fx;
      })
      .routeFormByAction()
      .routeFormDefinition()
      .routeFormResponse(fx => {
        fx.data = formResponse;

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
      .find('.form__submit-status')
      .should('contain', 'You don’t have permission to edit or submit this form.');

    cy
      .iframe()
      .find('.formio-read-only')
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');

    cy
      .get('.form__frame')
      .should('contain', 'Last submitted')
      .and('contain', formatDate(testTs(), 'LONG'));

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
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('22222', 'forms'),
            'form-responses': getRelationship([]),
          },
        });

        return fx;
      })
      .routePatient()
      .routeFormByAction(_.identity, '22222')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeActionActivity()
      .routePatientByAction()
      .routeFormActionFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: { foo: 'bar' },
          },
        });

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
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');
  });

  specify('routing to form-response', function() {
    const updatedAt = testTs();

    const formResponse = getFormResponse({
      id: '1',
      attributes: {
        updated_at: updatedAt,
        status: FORM_RESPONSE_STATUS.SUBMITTED,
        response: { data: { fields: { foo: 'bar' } } },
      },
    });

    const action = getAction({
      id: '1',
      relationships: {
        'form': getRelationship('11111', 'forms'),
        'form-responses': getRelationship([formResponse]),
      },
    });

    cy
      .routeActions(fx => {
        fx.data = [action];

        return fx;
      })
      .routeAction(fx => {
        fx.data = action;

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction()
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeFormResponse(fx => {
        fx.data = formResponse;

        return fx;
      })
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
      .and('contain', formatDate(updatedAt, 'AT_TIME'))
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
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'flow': getRelationship('1', 'flows'),
          },
        });

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction()
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormResponse()
      .routeFormActionFields()
      .routePatientByFlow()
      .routeFlow()
      .routeFlowActions()
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
      .should('contain', '/flow/1');
  });

  specify('routing to form - action without a flow', function() {
    const patient = getPatient({ id: '1' });

    cy
      .routesForPatientDashboard()
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'patient': getRelationship(patient),
            'form': getRelationship('11111', 'forms'),
          },
        });

        return fx;
      })
      .routePatientByAction(fx => {
        fx.data = patient;

        return fx;
      })
      .routeActionActivity()
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormResponse()
      .routeFormActionFields()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routePatientByAction');

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
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('22222', 'forms'),
            'form-responses': getRelationship([]),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '22222')
      .routeLatestFormResponse()
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

    const testField = getPatientField({
      attributes: {
        name: 'testField',
        value: 'Test field widget',
      },
    });

    cy
      .routeFormByAction(_.identity, '55555')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeActionActivity()
      .routeFormActionFields()
      .routeWidgetValues()
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('55555', 'forms'),
            'form-responses': getRelationship([]),
          },
        });

        return fx;
      })
      .routeWidgets(fx => {
        fx.data = [
          ...fx.data,
          getWidget({
            attributes: {
              category: 'fieldWidget',
              slug: 'testFieldWidget',
              definition: {
                display_name: 'Test Field',
                field_name: 'testField',
              },
            },
          }),
        ];

        return fx;
      })
      .routePatientByAction(fx => {
        fx.data = getPatient({
          id: '1',
          attributes: {
            first_name: 'First',
            last_name: 'Last',
            birth_date: dob,
            sex: 'f',
          },
          relationships: {
            'patient-fields': getRelationship([testField]),
          },
        });

        return fx;
      })
      .routeWorkspacePatient(fx => {
        fx.data.attributes.status = 'active';
        return fx;
      })
      .routePatientField(fx => {
        fx.data = testField;

        return fx;
      }, 'testField');

    cy
      .visit('/patient-action/1/form/55555')
      .wait('@routeFormByAction')
      .wait('@routeFormDefinition')
      .wait('@routePatientByAction')
      .wait('@routeAction')
      .wait('@routeWidgets')
      .wait('@routeWorkspacePatient')
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

    const patient = getPatient({ id: '1' });

    cy
      .routesForPatientDashboard()
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'flow': getRelationship('1', 'flows'),
            'patient': getRelationship(patient),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByFlow()
      .routeFlow()
      .routeFlowActions()
      .routePatientByAction(fx => {
        fx.data = patient;

        return fx;
      })
      .visitOnClock('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeWorkspacePatient')
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        delay: 100,
        body: { data: getFormResponse({ id: '12345' }) },
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
      .wait(200) // Account for iframe debounce
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
      });

    cy
      .tick(5100)
      .url()
      .should('contain', '/flow/1');
  });

  specify('submit and go back button - action without a flow', function() {
    localStorage.setItem('form-state_11111', JSON.stringify({ saveButtonType: 'saveAndGoBack' }));

    const patient = getPatient({ id: '1' });

    cy
      .routesForPatientDashboard()
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'flow': getRelationship(),
            'form': getRelationship('11111', 'forms'),
            'patient': getRelationship(patient),
          },
        });

        return fx;
      })
      .routePatientByAction(fx => {
        fx.data = patient;
        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition()
      .routeFormActionFields()
      .routeLatestFormResponse()
      .routeActionActivity()
      .visitOnClock('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeWorkspacePatient')
      .wait('@routeFormDefinition');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        delay: 100,
        body: { data: getFormResponse({ id: '12345' }) },
      })
      .as('routePostResponse');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .type('Once upon a time...');

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .click();

    cy
      .wait('@routePostResponse');

    cy
      .tick(5100)
      .url()
      .should('contain', '/patient/dashboard/1');
  });

  specify('submit and go back button - form response error', function() {
    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([]),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeWorkspacePatient')
      .wait('@routeFormDefinition');

    const errors = getErrors({
      status: '403',
      title: 'Forbidden',
      detail: 'Insufficient permissions',
    });

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 403,
        delay: 100,
        body: { errors },
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
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('11111', 'forms'),
            'form-responses': getRelationship([]),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .visitOnClock('/patient-action/1/form/11111', { now: testTs() })
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routeFormDefinition');

    const errors = getErrors({
      status: '403',
      title: 'Forbidden',
      detail: 'Insufficient permissions',
    });

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 403,
        delay: 100,
        body: { errors },
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
      .tick(15000);

    cy
      .wait('@postFormResponse');

    // for when an update draft request returns a 403 error
    cy
      .get('.alert-box')
      .should('contain', 'You don’t have permission to edit or submit this form.');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Submit')
      .click()
      .wait('@postFormResponse');

    cy
      .get('.alert-box')
      .should('contain', 'You don’t have permission to edit or submit this form.');

    cy
      .get('@iframe')
      .find('.alert')
      .contains('Insufficient permissions');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 400,
        delay: 100,
        body: {
          errors: [
            {
              id: '1',
              status: '400',
              title: 'Invalid',
              detail: 'Invalid request parameters',
            },
          ],
        },
      })
      .as('postFormResponse');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Submit')
      .click()
      .wait('@postFormResponse');

    cy
      .get('.alert-box')
      .should('not.exist');

    cy
      .get('@iframe')
      .find('.alert')
      .contains('Invalid request parameters');
  });

  specify('hidden submit button', function() {
    cy
      .routeAction()
      .routeFormByAction(_.identity, '88888')
      .routeLatestFormResponse()
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
        fx.data = getAction({
          id: '1',
          relationships: {
            'form': getRelationship('88888', 'forms'),
            'form-responses': getRelationship([{ id: '11111' }], 'form-responses'),
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, '88888')
      .routeFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
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

  specify('user has work:owned:submit permission', function() {
    const currentClinician = getCurrentClinician({
      relationships: {
        role: getRelationship(roleNoFilterEmployee),
      },
    });

    const patient = getPatient({ id: '1' });

    const action1 = getAction({
      id: '1',
      attributes: {
        name: 'Owned by current clinician',
      },
      relationships: {
        patient: getRelationship(patient),
        owner: getRelationship(currentClinician),
        state: getRelationship(stateInProgress),
        form: getRelationship('11111', 'forms'),
      },
    });

    const action2 = getAction({
      id: '2',
      attributes: {
        name: 'Not owned by current clinician',
      },
      relationships: {
        patient: getRelationship(patient),
        owner: getRelationship({ id: '22222', type: 'clinicians' }),
        state: getRelationship(stateTodo),
        form: getRelationship('22222', 'forms'),
      },
    });

    cy
      .routesForPatientAction()
      .routeCurrentClinician(fx => {
        fx.data = currentClinician;

        return fx;
      })
      .routePatient(fx => {
        fx.data = patient;

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = [action1, action2];

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = [];

        return fx;
      })
      .routeAction(fx => {
        fx.data = action1;

        return fx;
      })
      .routeFormActionFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: { foo: 'bar' },
          },
        });

        return fx;
      })
      .routePatientByAction()
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .first()
      .find('[data-form-region] button')
      .click()
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .should('exist');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('exist');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('not.be.disabled');

    cy
      .get('.form__context-trail')
      .find('.js-back')
      .click()
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .routeAction(fx => {
        fx.data = action2;

        return fx;
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .last()
      .find('[data-form-region] button')
      .click();

    cy
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'You don’t have permission to edit or submit this form.');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('not.exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('not.exist');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');
  });

  specify('user has work:team:submit permission', function() {
    const currentClinician = getCurrentClinician({
      relationships: {
        role: getRelationship(roleTeamEmployee),
        team: getRelationship(teamCoordinator),
      },
    });

    const nonTeamClinician = getClinician({
      id: '2',
      attributes: {
        name: 'Non Team Member',
      },
      relationships: {
        team: getRelationship(teamNurse),
      },
    });

    const patient = getPatient({ id: '1' });

    const action1 = getAction({
      id: '1',
      attributes: {
        name: 'Owned by current clinician',
      },
      relationships: {
        patient: getRelationship(patient),
        owner: getRelationship(currentClinician),
        state: getRelationship(stateInProgress),
        form: getRelationship('11111', 'forms'),
      },
    });

    const action2 = getAction({
      id: '2',
      attributes: {
        name: 'Owned by another team',
      },
      relationships: {
        patient: getRelationship(patient),
        owner: getRelationship(teamNurse),
        state: getRelationship(stateTodo),
        form: getRelationship('22222', 'forms'),
      },
    });

    const action3 = getAction({
      id: '3',
      attributes: {
        name: 'Owned by non team member',
      },
      relationships: {
        patient: getRelationship(patient),
        owner: getRelationship('22222', 'clinicians'),
        state: getRelationship(stateTodo),
        form: getRelationship('22222', 'forms'),
      },
    });

    cy
      .routesForPatientAction()
      .routeCurrentClinician(fx => {
        fx.data = currentClinician;

        return fx;
      })
      .routeWorkspaceClinicians(fx => {
        fx.data = [currentClinician, nonTeamClinician];

        return fx;
      })
      .routePatient(fx => {
        fx.data = patient;

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = [action1, action2, action3];

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = [];

        return fx;
      })
      .routeAction(fx => {
        fx.data = action1;

        return fx;
      })
      .routeFormActionFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: { foo: 'bar' },
          },
        });

        return fx;
      })
      .routePatientByAction()
      .routeFormByAction(_.identity, '11111')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .first()
      .find('[data-form-region] button')
      .click()
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__controls')
      .find('.js-save-button')
      .should('exist');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('exist');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('not.be.disabled');

    cy
      .get('.form__context-trail')
      .find('.js-back')
      .click()
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .routeAction(fx => {
        fx.data = action2;

        return fx;
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .eq(1)
      .find('[data-form-region] button')
      .click();

    cy
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'You don’t have permission to edit or submit this form.');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('not.exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('not.exist');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');

    cy
      .get('.form__context-trail')
      .find('.js-back')
      .click()
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .routeAction(fx => {
        fx.data = action3;

        return fx;
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .as('listItems')
      .last()
      .find('[data-form-region] button')
      .click();

    cy
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'You don’t have permission to edit or submit this form.');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .should('not.exist');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('not.exist');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar')
      .should('be.disabled');
  });

  specify('report form', function() {
    const createdAt = testTs();
    cy
      .routeAction(fx => {
        fx.data = getAction({
          attributes: {
            created_at: createdAt,
            tags: ['prefill-latest-response'],
          },
        });

        return fx;
      })
      .routeFormByAction(_.identity, 'BBBBB')
      .routeLatestFormResponse()
      .routeFormDefinition()
      .routeFormActionFields()
      .routePatientByAction()
      .routeLatestFormSubmission()
      .visit('/patient-action/1/form/BBBBB')
      .wait('@routeAction')
      .wait('@routeFormByAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]');

    cy
      .wait('@routeLatestFormSubmission')
      .itsUrl()
      .its('search')
      .should('contain', `filter[created]=<=${ createdAt }`);
  });
});
