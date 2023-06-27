context('Form service', function() {
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
            'components': [
              {
                'key': 'patient.fields.insurance',
                'type': 'container',
                'input': true,
                'label': 'Insurance',
                'tableView': false,
                'components': [
                  {
                    'key': 'name',
                    'type': 'textfield',
                    'input': true,
                    'label': 'Insurance Name',
                    'tableView': true,
                  },
                ],
              },
            ],
          },
          formData: {
            'patient': {
              'fields': {
                'insurance': {
                  'name': 'Test Insurance Name',
                },
              },
            },
          },
          formSubmission: {
            'patient': {
              'fields': {
                'insurance': {
                  'name': 'Test Insurance Name',
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
      .intercept('GET', '/api/form-responses/1/response', {
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
      .routeLatestFormResponseByAction()
      .visit('/formapp/pdf/action/1', { noWait: true, isRoot: true });

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formservice/1');

    cy
      .window()
      .then(win => {
        win.postMessage({ message: 'form:pdf', args: {
          definition: {
            'components': [
              {
                'key': 'patient.fields.insurance',
                'type': 'container',
                'input': true,
                'label': 'Insurance',
                'tableView': false,
                'components': [
                  {
                    'key': 'name',
                    'type': 'textfield',
                    'input': true,
                    'label': 'Insurance Name',
                    'tableView': true,
                  },
                ],
              },
            ],
          },
          formData: {
            'patient': {
              'fields': {
                'insurance': {
                  'name': 'Test Insurance Name',
                },
              },
            },
          },
          formSubmission: {
            'patient': {
              'fields': {
                'insurance': {
                  'name': 'Test Insurance Name',
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
      .intercept('GET', '/api/actions/1/form-responses/latest', {
        statusCode: 200,
        body: { data: {} },
      })
      .as('routeLatestFormResponseByAction');

    cy
      .visit('/formservice/1', { noWait: true, isRoot: true })
      .wait('@routeFormModelByAction')
      .wait('@routeFormDefinitionByAction')
      .wait('@routeActionFormFields')
      .wait('@routeLatestFormResponseByAction');
  });
});
