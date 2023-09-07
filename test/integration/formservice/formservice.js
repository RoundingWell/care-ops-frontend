import _ from 'underscore';

context('Formservice', function() {
  specify('display form with a response', function() {
    cy
      .visit('/formapp/pdf/1/1/1', { noWait: true, isRoot: true });

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formservice/1/1/1');

    cy
      .window()
      .then(win => {
        win.postMessage({ message: 'form:pdf', args: {
          definition: {
            components: [
              {
                key: 'patient.fields.insurance',
                type: 'container',
                input: true,
                label: 'Insurance',
                tableView: false,
                components: [
                  {
                    key: 'name',
                    type: 'textfield',
                    input: true,
                    label: 'Insurance Name',
                    tableView: true,
                  },
                ],
              },
            ],
          },
          formData: {
            patient: {
              fields: {
                insurance: {
                  name: 'Test Insurance Name',
                },
              },
            },
          },
          formSubmission: {
            patient: {
              fields: {
                insurance: {
                  name: 'Test Insurance Name',
                },
              },
            },
          },
          contextScripts: {},
          reducers: [],
        } }, win.origin);
      });

    cy
      .get('[name="data[patient.fields.insurance][name]"]')
      .should('have.value', 'Test Insurance Name');
  });

  specify('formservice iframe makes correct api requests', function() {
    cy
      .intercept('GET', '/api/forms/1', {
        statusCode: 200,
        body: {},
      })
      .as('routeFormModel');

    cy
      .intercept('GET', '/api/forms/1/definition', {
        statusCode: 200,
        body: {},
      })
      .as('routeFormDefinition');

    cy
      .intercept('GET', '/api/forms/1/fields?filter[patient]=1', {
        statusCode: 200,
        body: { data: {} },
      })
      .as('routeFormPatientFields');

    cy
      .intercept('GET', '/api/form-responses/1', {
        statusCode: 200,
        body: {},
      })
      .as('routeFormResponse');

    cy
      .visit('/formservice/1/1/1', { noWait: true, isRoot: true })
      .wait('@routeFormModel')
      .wait('@routeFormDefinition')
      .wait('@routeFormPatientFields')
      .wait('@routeFormResponse');
  });

  specify('display action form with a response', function() {
    cy
      .routeFormByAction()
      .routeFormActionDefinition()
      .routeFormActionFields()
      .routeAction()
      .routeLatestFormSubmission()
      .visit('/formapp/pdf/action/1', { noWait: true, isRoot: true });

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formservice/action/1');

    cy
      .window()
      .then(win => {
        win.postMessage({ message: 'form:pdf', args: {
          definition: {
            components: [
              {
                key: 'patient.fields.insurance',
                type: 'container',
                input: true,
                label: 'Insurance',
                tableView: false,
                components: [
                  {
                    key: 'name',
                    type: 'textfield',
                    input: true,
                    label: 'Insurance Name',
                    tableView: true,
                  },
                ],
              },
            ],
          },
          formData: {
            patient: {
              fields: {
                insurance: {
                  name: 'Test Insurance Name',
                },
              },
            },
          },
          formSubmission: {
            patient: {
              fields: {
                insurance: {
                  name: 'Test Insurance Name',
                },
              },
            },
          },
          contextScripts: {},
          reducers: [],
        } }, win.origin);
      });

    cy
      .get('[name="data[patient.fields.insurance][name]"]')
      .should('have.value', 'Test Insurance Name');
  });

  specify('action formservice latest response from action tags', function() {
    cy
      .routeFormByAction(_.identity, '77777')
      .routeFormActionDefinition()
      .routeLatestFormResponse()
      .routeFormActionFields()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '77777' };
        fx.data.relationships['program-action'] = { data: { id: '11111' } };
        fx.data.relationships.flow = { data: { id: '1' } };
        fx.data.relationships.patient = { data: { id: '1' } };

        fx.data.attributes.tags = ['prefill-latest-response'];

        return fx;
      })
      .routeLatestFormSubmission()
      .visit('/formapp/pdf/action/1', { noWait: true, isRoot: true });

    cy
      .wait('@routeLatestFormSubmission')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[action.tags]=foo-tag')
      .should('contain', 'filter[flow]=1')
      .should('contain', 'filter[patient]=1');
  });

  specify('action formservice iframe makes correct api requests', function() {
    cy
      .intercept('GET', '/api/actions/1/form', {
        statusCode: 200,
        body: { data: {} },
      })
      .as('routeFormModelByAction');

    cy
      .intercept('GET', '/api/actions/1/form/definition', {
        statusCode: 200,
        body: { data: {} },
      })
      .as('routeFormDefinitionByAction');

    cy
      .intercept('GET', '/api/actions/1/form/fields', {
        statusCode: 200,
        body: { data: {} },
      })
      .as('routeActionFormFields');

    cy
      .intercept('GET', '/api/actions/1*', {
        statusCode: 200,
        body: { data: {} },
      })
      .as('routeAction');

    cy
      .intercept('GET', '/api/form-responses/latest?filter[status]=submitted', {
        statusCode: 204,
      })
      .as('routeLatestFormSubmission');

    cy
      .visit('/formservice/action/1', { noWait: true, isRoot: true })
      .wait('@routeFormModelByAction')
      .wait('@routeFormDefinitionByAction')
      .wait('@routeActionFormFields')
      .wait('@routeAction')
      .wait('@routeLatestFormSubmission');
  });
});
