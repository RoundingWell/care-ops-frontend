context('Outreach', function() {
  beforeEach(function() {
    cy.viewport('iphone-x');
  });
  specify('Form', function() {
    cy
      .server()
      .route({
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
          data: {
            id: '1',
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .route({
        url: '/api/actions/1/form',
        response: {
          data: {
            id: '1',
            type: 'forms',
            attributes: {
              name: 'Form Name',
            },
          },
        },
      })
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/1', { noWait: true });

    cy
      .get('.js-date')
      .type('1990-10-01')
      .trigger('change')
      .trigger('blur');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeFormActionFields')
      .wait('@routeFormActionDefinition');

    cy
      .get('.form__title')
      .contains('Form Name');

    cy
      .route({
        url: '/api/actions/1/relationships/form-responses',
        method: 'POST',
        status: 400,
        delay: 100,
        response: {
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
      .route({
        url: '/api/actions/1/relationships/form-responses',
        method: 'POST',
        delay: 100,
        response: {},
      })
      .as('postFormResponse');

    /* NOTE: Commented out due to flakiness
    cy
      .get('[data-action-region]')
      .find('button')
      .click();

    cy
      .get('body')
      .contains('You’ve submitted the form. Nice job.');
    */
  });

  specify('Read-only Form', function() {
    cy
      .server()
      .route({
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
          data: {
            id: '1',
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .route({
        url: '/api/actions/1/form',
        response: {
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
      .visit('/outreach/1', { noWait: true });

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
      .server()
      .visit('/outreach/1', { noWait: true });

    cy
      .route({
        status: 400,
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
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
      .route({
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
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
      .route({
        status: 500,
        url: '/api/actions/1/form',
        response: {
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
      .then(({ requestHeaders }) => {
        expect(requestHeaders.Authorization).to.eql('Bearer token-success');
      });
  });

  specify('General Error', function() {
    cy
      .server()
      .visit('/outreach/1', { noWait: true });

    cy
      .route({
        status: 500,
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
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
      .server()
      .visit('/outreach/1', { noWait: true });

    cy
      .route({
        status: 409,
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
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
      .server()
      .visit('/outreach/1', { noWait: true });

    cy
      .route({
        status: 403,
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
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
      .server()
      .visit('/outreach/1', { noWait: true });

    cy
      .route({
        status: 404,
        method: 'POST',
        url: '/api/patient-tokens',
        response: {
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
