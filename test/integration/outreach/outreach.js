context('Outreach', function() {
  beforeEach(function() {
    cy.viewport('iphone-x');
  });

  specify('Opt In Success', function() {
    cy
      .visit('/outreach/opt-in', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/opt-in', {
        delay: 100,
        body: {
          data: {
            first_name: 'Test',
            last_name: 'Patient',
            birth_date: '1990-10-01',
            phone: '+18887771234',
            email: 'testpatient@domain.com',
          },
        },
      })
      .as('routeOptInRequest');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-first-name')
      .type('Test');

    cy
      .get('.js-last-name')
      .type('Patient');

    cy
      .get('.js-dob')
      .type('1990-10-01');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-phone')
      .type('+18887771234');

    cy
      .get('.js-submit')
      .should('not.be.disabled');

    cy
      .get('.js-email')
      .type('testpatient@domain.com');

    cy
      .get('.js-first-name')
      .clear();

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-first-name')
      .type('Test');

    cy
      .get('.js-submit')
      .should('not.be.disabled');

    cy
      .get('.js-submit')
      .click()
      .should('be.disabled');

    cy
      .wait('@routeOptInRequest');

    cy
      .get('.opt-in__heading-text')
      .should('contain', 'Your contact info is confirmed.');
  });

  specify('Opt In Error', function() {
    cy
      .visit('/outreach/opt-in', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/opt-in', {
        statusCode: 403,
        body: { data: {} },
      })
      .as('routeOptInRequest')
      .visit('/outreach/opt-in', { noWait: true, isRoot: true });

    cy
      .get('.js-first-name')
      .type('Test');

    cy
      .get('.js-last-name')
      .type('Patient');

    cy
      .get('.js-dob')
      .type('1990-10-01');

    cy
      .get('.js-phone')
      .type('+18887771234');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeOptInRequest');

    cy
      .get('.opt-in__heading-text')
      .should('contain', 'We were not able to confirm your contact info.');

    cy
      .get('.js-try-again')
      .click();

    cy
      .get('.opt-in__heading-text')
      .first()
      .should('contain', 'Hi, we need to confirm your contact info.');

    cy
      .get('.js-submit')
      .should('not.be.disabled');
  });

  specify('Form', function() {
    cy
      .intercept('POST', '/api/patient-tokens', {
        body: {
          data: {
            id: '1',
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .as('routePatientToken')
      .intercept('GET', '/api/actions/1/form', {
        body: {
          data: {
            id: '1',
            type: 'forms',
            attributes: {
              name: 'Form Name',
            },
          },
        },
      })
      .as('routeFormAction')
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .click()
      .wait('@routePatientToken')
      .wait('@routeFormAction')
      .wait('@routeFormActionFields')
      .wait('@routeFormActionDefinition');

    cy
      .get('.form__title')
      .contains('Form Name');

    cy
      .intercept('POST', '/api/actions/1/relationships/form-responses', {
        statusCode: 400,
        delay: 100,
        body: {
          errors: [
            {
              id: '1',
              status: 400,
              title: 'Form Error',
              detail: 'This is a form error',
            },
          ],
        },
      })
      .as('postFormResponseError');

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
      .get('[data-action-region]')
      .contains('Save')
      .click()
      .wait('@postFormResponseError');

    cy
      .iframe()
      .find('.alert')
      .contains('This is a form error');

    cy
      .intercept('POST', '/api/actions/1/relationships/form-responses', {
        delay: 100,
        body: { data: {} },
      })
      .as('postFormResponse');

    cy
      .get('[data-action-region]')
      .find('button')
      .click()
      .wait('@postFormResponse');

    cy
      .get('body')
      .contains('You’ve submitted the form. Nice job.');
  });

  specify('Read-only Form', function() {
    cy
      .intercept('POST', '/api/patient-tokens', {
        body: {
          data: {
            id: '1',
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .intercept('GET', '/api/actions/1/form', {
        body: {
          data: {
            id: '1',
            type: 'forms',
            attributes: {
              name: 'Read-only Form',
              options: {
                read_only: true,
              },
            },
          },
        },
      })
      .routeFormActionDefinition()
      .routeFormActionFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeFormActionFields');

    cy
      .get('.form__title')
      .contains('Read-only Form');

    cy
      .get('[data-action-region]')
      .should('not.contain', 'Save');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .find('textarea[name="data[storyTime]"]')
      .should('have.value', 'Once upon a time...');
  });

  specify('Login', function() {
    cy
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/patient-tokens', {
        statusCode: 400,
        body: {
          errors: [
            {
              id: '1',
              status: 400,
              title: 'Foo',
              detail: 'bar',
            },
          ],
        },
      })
      .as('postFormToken');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormToken');

    cy
      .get('.dialog__error')
      .contains('That date of birth does not match our records. Please try again.');

    cy
      .get('.js-date')
      .type('1990-10-10')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.has-errors')
      .should('not.exist');

    cy
      .intercept('POST', '/api/patient-tokens', {
        body: {
          data: {
            id: '1',
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .as('postFormToken');

    cy
      .intercept('GET', '/api/actions/1/form', {
        statusCode: 500,
        body: {
          errors: [
            {
              id: '1',
              status: 500,
              title: 'Foo',
              detail: 'bar',
            },
          ],
        },
      })
      .as('routeFormError');

    cy
      .get('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormToken');

    cy
      .wait('@routeFormError')
      .its('request.headers')
      .should('have.property', 'authorization', 'Bearer token-success');
  });

  specify('General Error', function() {
    cy
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/patient-tokens', {
        statusCode: 500,
        body: {
          errors: [
            {
              id: '1',
              status: 500,
              title: 'Foo',
              detail: 'bar',
            },
          ],
        },
      })
      .as('postFormToken');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormToken');

    cy
      .get('body')
      .contains('Uh-oh');
  });

  specify('Already Submitted', function() {
    cy
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/patient-tokens', {
        statusCode: 409,
        body: {
          errors: [
            {
              id: '1',
              status: 409,
              title: 'Foo',
              detail: 'bar',
            },
          ],
        },
      })
      .as('postFormToken');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormToken');

    cy
      .get('body')
      .contains('This form has already been submitted.');
  });

  specify('Unavailable', function() {
    cy
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/patient-tokens', {
        statusCode: 403,
        body: {
          errors: [
            {
              id: '1',
              status: 403,
              title: 'Foo',
              detail: 'bar',
            },
          ],
        },
      })
      .as('postFormToken');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormToken');

    cy
      .get('body')
      .contains('This form is no longer shared.');
  });

  specify('Not Found', function() {
    cy
      .visit('/outreach/1', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/patient-tokens', {
        statusCode: 404,
        body: {
          errors: [
            {
              id: '1',
              status: 404,
              title: 'Foo',
              detail: 'bar',
            },
          ],
        },
      })
      .as('postFormToken');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .should('not.be.disabled')
      .click()
      .wait('@postFormToken');

    cy
      .get('body')
      .contains('This form is no longer shared.');
  });
});
