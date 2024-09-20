import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { getErrors, mergeJsonApi } from 'helpers/json-api';

import { getFormFields } from 'support/api/form-fields';
import { getFormResponse } from 'support/api/form-responses';
import { getPatient } from 'support/api/patients';
import { getWidget } from 'support/api/widgets';
import { testForm, testReadOnlyForm, testWidgetsForm, testSubmitHiddenForm } from 'support/api/forms';
import { getCurrentClinician } from 'support/api/clinicians';

import { FORM_RESPONSE_STATUS } from 'js/static';

const testPatient = getPatient();
const currentClinician = getCurrentClinician();

context('Patient Form', function() {
  beforeEach(function() {
    cy
      .routeWorkspacePatient();
  });

  specify('submitting the form', function() {
    cy
      .routesForPatientAction()
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeFormFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: {
              weight: 200,
            },
            patient: {
              first_name: 'Joe',
              last_name: 'Johnson',
            },
          },
        });

        return fx;
      })
      .routeLatestFormResponse()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visit(`/patient/${ testPatient.id }/form/${ testForm.id }`)
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeWorkspacePatient')
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
      .type('Once upon a time...');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        delay: 100,
        body: { data: getFormResponse({ id: '12345' }) },
      })
      .as('routePostResponse');

    cy
      .get('.form__controls')
      .find('button')
      .contains('Submit')
      .click();

    cy
      .routeFormResponse()
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action).to.be.undefined;
        expect(data.relationships.form.data.id).to.equal(testForm.id);
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.first_name).to.equal('Joe');
        expect(data.attributes.response.data.patient.last_name).to.equal('Johnson');
        expect(data.attributes.response.data.fields.weight).to.equal(200);
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
      .should('contain', `/dashboard/${ testPatient.id }`);

    cy
      .go('back');
  });

  specify('storing stored submission', function() {
    cy
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeFormFields()
      .routeLatestFormResponse()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visitOnClock(`/patient/${ testPatient.id }/form/${ testForm.id }`, { now: testTs() })
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .intercept('POST', '/api/form-responses', {
        statusCode: 201,
        body: { data: getFormResponse({ id: '12345' }) },
      })
      .as('routePostResponse');


    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .type('bar');

    cy
      .wait(300) // NOTE: must wait due to debounce in iframe
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`form-subm-${ currentClinician.id }-${ testPatient.id }-${ testForm.id }`));

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
        expect(data.attributes.status).to.equal(FORM_RESPONSE_STATUS.DRAFT);
      });

    cy
      .tick(45000);

    cy
      .get('.form__controls')
      .find('.form__submit-status-text')
      .should('contain', 'Last edit was a minute ago');
  });

  specify('restoring draft', function() {
    localStorage.setItem(`form-subm-${ currentClinician.id }-${ testPatient.id }-${ testForm.id }`, JSON.stringify({
      updated: testTsSubtract(1),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    cy
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeLatestFormResponse(() => {
        return {
          data: getFormResponse({
            attributes: {
              status: FORM_RESPONSE_STATUS.DRAFT,
              updated_at: testTs(),
              response: {
                data: {
                  fields: { foo: 'bar' },
                },
              },
            },
          }),
        };
      })
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visitOnClock(`/patient/${ testPatient.id }/form/${ testForm.id }`, { now: testTs() })
      .wait('@routeForm')
      .wait('@routePatient');

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
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('restoring stored submission', function() {
    localStorage.setItem(`form-subm-${ currentClinician.id }-${ testPatient.id }-${ testForm.id }`, JSON.stringify({
      updated: testTs(),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    cy
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeLatestFormResponse(() => {
        return {
          data: getFormResponse({
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
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visitOnClock(`/patient/${ testPatient.id }/form/${ testForm.id }`, { now: testTs() })
      .wait('@routeForm')
      .wait('@routePatient');

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
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'foo');
  });

  specify('discarding stored submission', function() {
    localStorage.setItem(`form-subm-${ currentClinician.id }-${ testPatient.id }-${ testForm.id }`, JSON.stringify({
      updated: testTs(),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    cy
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .routeFormFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: {
              foo: 'bar',
            },
          },
        });

        return fx;
      })
      .routeLatestFormResponse()
      .visitOnClock(`/patient/${ testPatient.id }/form/${ testForm.id }`, { now: testTs() })
      .wait('@routeForm')
      .wait('@routePatient');

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
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    cy
      .get('.form__controls')
      .find('.form__submit-status')
      .should('contain', 'Your work is stored automatically.')
      .should('not.contain', 'Last edit was');

    cy
      .iframe()
      .find('[name="data[fields.foo]"]')
      .should('have.value', 'bar');
  });

  specify('read only form', function() {
    localStorage.setItem(`form-subm-${ currentClinician.id }-${ testPatient.id }-${ testReadOnlyForm.id }`, JSON.stringify({
      updated: testTs(),
      submission: {
        fields: { foo: 'foo' },
      },
    }));

    cy
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .routeForm(_.identity, testReadOnlyForm.id)
      .routeFormDefinition()
      .routeLatestFormResponse()
      .routeFormFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: {
              foo: 'bar',
            },
          },
        });

        return fx;
      })
      .visit(`/patient/${ testPatient.id }/form/${ testReadOnlyForm.id }`)
      .wait('@routeForm')
      .wait('@routePatient')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

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
      .should('have.value', 'bar');
  });

  specify('store expanded state in localStorage', function() {
    localStorage.setItem(`form-state_${ currentClinician.id }`, JSON.stringify({ isExpanded: false }));

    cy
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .routeForm(_.identity, testReadOnlyForm.id)
      .routeFormDefinition()
      .routeFormFields()
      .routeLatestFormResponse()
      .visit(`/patient/${ testPatient.id }/form/${ testReadOnlyForm.id }`)
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
        const storage = JSON.parse(localStorage.getItem(`form-state_${ currentClinician.id }`));

        expect(storage.isExpanded).to.be.true;
      });

    cy
      .get('@expandButton')
      .trigger('mouseout')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`form-state_${ currentClinician.id }`));

        expect(storage.isExpanded).to.be.false;
      });
  });

  specify('form header widgets', function() {
    const dob = testDateSubtract(10, 'years');

    cy
      .routeForm(_.identity, testWidgetsForm.id)
      .routeFormDefinition()
      .routeFormFields()
      .routeWidgetValues(fx => {
        fx.values = { sex: 'f' };
        return fx;
      })
      .routeLatestFormResponse()
      .routeWidgets(fx => {
        fx.data.push(getWidget({
          attributes: {
            category: 'widget',
            slug: 'hbsWidget',
            definition: {
              display_name: 'Template',
              template: `
                <hr>
                <div>{{far "calendar-days"}}Sex: <b>{{ sex }}</b></div>
                <hr>
              `,
            },
            values: {
              sex: '@patient.sex',
            },
          },
        }));

        return fx;
      })
      .routePatient(fx => {
        fx.data = mergeJsonApi(testPatient, {
          attributes: {
            first_name: 'First',
            last_name: 'Last',
            birth_date: dob,
            sex: 'f',
          },
        });

        return fx;
      })
      .routeWorkspacePatient(fx => {
        fx.data.attributes.status = 'active';
        return fx;
      });

    cy
      .visitOnClock(`/patient/${ testPatient.id }/form/${ testWidgetsForm.id }`, { now: testTs() })
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields')
      .wait('@routeWidgets')
      .wait('@routePatient')
      .wait('@routeWorkspacePatient');

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
      .should('contain', 'Template')
      .should('contain', 'Sex: f');
  });

  specify('submit and go back button', function() {
    localStorage.setItem(`form-state_${ currentClinician.id }`, JSON.stringify({ saveButtonType: 'saveAndGoBack' }));

    cy
      .routesForPatientDashboard()
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeFormFields(fx => {
        fx.data = getFormFields({
          attributes: {
            fields: {
              weight: 200,
            },
            patient: {
              first_name: 'Joe',
              last_name: 'Johnson',
            },
          },
        });

        return fx;
      })
      .routeLatestFormResponse()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visitOnClock(`/patient/${ testPatient.id }/form/${ testForm.id }`, { now: testTs() })
      .wait('@routeForm')
      .wait('@routePatient')
      .wait('@routeFormDefinition')
      .wait('@routeWorkspacePatient')
      .wait('@routeFormFields');

    cy
      .iframe()
      .find('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .type('Once upon a time...');

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
        const storage = JSON.parse(localStorage.getItem(`form-state_${ currentClinician.id }`));

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
        const storage = JSON.parse(localStorage.getItem(`form-state_${ currentClinician.id }`));

        expect(storage.saveButtonType).to.equal('saveAndGoBack');
      });

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
        expect(data.relationships.action).to.be.undefined;
        expect(data.relationships.form.data.id).to.equal(testForm.id);
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.first_name).to.equal('Joe');
        expect(data.attributes.response.data.patient.last_name).to.equal('Johnson');
        expect(data.attributes.response.data.fields.weight).to.equal(200);
      });

    cy
      .tick(5100)
      .url()
      .should('contain', `/patient/dashboard/${ testPatient.id }`);
  });

  specify('submit and go back button - form response error', function() {
    cy
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeFormFields()
      .routeLatestFormResponse()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visit(`/patient/${ testPatient.id }/form/${ testForm.id }`)
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields')
      .wait('@routeWorkspacePatient')
      .wait('@routePatient');

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
      .should('have.length', 2)
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
      .routeForm(_.identity, testForm.id)
      .routeFormDefinition()
      .routeFormFields()
      .routeLatestFormResponse()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visit(`/patient/${ testPatient.id }/form/${ testForm.id }`)
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields')
      .wait('@routePatient');

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
      .routeForm(_.identity, testSubmitHiddenForm.id)
      .routeFormDefinition()
      .routeFormFields()
      .routeLatestFormResponse()
      .routePatient()
      .visit(`/patient/${ testPatient.id }/form/${ testSubmitHiddenForm.id }`)
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

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
