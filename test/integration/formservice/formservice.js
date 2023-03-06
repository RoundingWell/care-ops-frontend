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
      .route({
        status: 400,
        method: 'GET',
        url: '/api/forms/1',
        response: {},
      })
      .as('routeFormModel');

    cy
      .route({
        status: 400,
        method: 'GET',
        url: '/api/forms/1/definition',
        response: {},
      })
      .as('routeFormDefinition');

    cy
      .route({
        status: 400,
        method: 'GET',
        url: '/api/forms/1/fields?filter[patient]=1',
        response: {},
      })
      .as('routeFormPatientFields');

    cy
      .route({
        status: 400,
        method: 'GET',
        url: '/api/form-responses/1/response',
        response: {},
      })
      .as('routeFormResponse');

    cy
      .visit('/formservice/1/1/1', { noWait: true, isRoot: true })
      .wait('@routeFormModel')
      .wait('@routeFormDefinition')
      .wait('@routeFormPatientFields')
      .wait('@routeFormResponse');
  });
});
