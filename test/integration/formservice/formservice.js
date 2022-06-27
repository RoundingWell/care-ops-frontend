context('Formservice', function() {
  specify('display form with a response', function() {
    cy
      .visit('/formapp/pdf/1/1/1', { noWait: true });

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
              {
                'key': 'patient.fields.pcp',
                'type': 'container',
                'input': true,
                'label': 'PCP',
                'tableView': false,
                'components': [
                  {
                    'key': 'name',
                    'type': 'textfield',
                    'input': true,
                    'label': 'PCP Name',
                    'tableView': true,
                  },
                ],
              },
              {
                'key': 'patient.fields.address',
                'type': 'container',
                'input': true,
                'label': 'Address',
                'tableView': false,
                'components': [
                  {
                    'key': 'state',
                    'type': 'textfield',
                    'input': true,
                    'label': 'State',
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
                'pcp': {
                  'name': 'Test PCP Name',
                },
              },
            },
          },
          formSubmission: {
            'patient': {
              'fields': {
                'pcp': {
                  'name': 'Test PCP Name',
                },
                'address': {
                  'state': 'Test State Name',
                },
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

    cy
      .get('[name="data[patient.fields.pcp][name]"]')
      .should('have.value', 'Test PCP Name');

    cy
      .get('[name="data[patient.fields.address][state]"]')
      .should('have.value', 'Test State Name');
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
      .visit('formservice/1/1/1', { noWait: true })
      .wait('@routeFormModel')
      .wait('@routeFormDefinition')
      .wait('@routeFormPatientFields')
      .wait('@routeFormResponse');
  });
});
