context('Outreach', function() {
  beforeEach(function() {
    cy.viewport('iphone-x');
  });

  specify('Opt-In success', function() {
    cy
      .visit('/outreach/opt-in', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach', {
        delay: 100,
        statusCode: 204,
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
      .get('.js-birth-date')
      .type('1990-10-01');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-phone')
      .type('Not a valid phone number.');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.js-phone')
      .clear()
      .type('+18887771234');

    cy
      .get('.js-submit')
      .should('not.be.disabled');

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

  specify('Opt-In error', function() {
    cy
      .visit('/outreach/opt-in', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach', {
        delay: 100,
        statusCode: 400,
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
      .get('.js-birth-date')
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

  specify('User verification success', function() {
    cy
      .intercept('GET', '/api/actions/11111/form', {
        body: {
          data: {
            id: '11111',
            type: 'forms',
            attributes: {
              name: 'Form Name',
            },
          },
        },
      })
      .as('routeFormAction')
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        body: {
          data: {
            id: '22222',
            type: 'outreach',
            attributes: {
              phone_end: '1234',
            },
          },
        },
      })
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/otp', {
        delay: 100,
        statusCode: 204,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.verify__heading-text')
      .should('contain', 'Request a verification code to view this health resource.');

    cy
      .get('.verify__info-text')
      .should('contain', 'We’ll send a text message with a verification code to the phone number XXX-XXX-1234.');

    cy
      .get('.js-submit')
      .click()
      .should('be.disabled');

    cy
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('.verify__heading-text')
      .should('contain', 'Enter your verification code.');

    cy
      .get('.verify__info-text')
      .should('contain', 'We sent a text message with a verification code to the phone number XXX-XXX-1234.');

    cy
      .get('.js-resend')
      .click();

    cy
      .get('.verify__heading-text')
      .should('contain', 'Request a verification code to view this health resource.');

    cy
      .get('.verify__info-text')
      .should('contain', 'We’ll send a text message with a verification code to the phone number XXX-XXX-1234.');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .type('1234');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .should('have.value', '1')
      .next()
      .should('have.value', '2')
      .next()
      .should('have.value', '3')
      .next()
      .should('have.value', '4');

    cy
      .get('.js-submit')
      .should('not.be.disabled');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .last()
      .type('{backspace}{backspace}{backspace}{backspace}');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .should('have.value', '')
      .next()
      .should('have.value', '')
      .next()
      .should('have.value', '')
      .next()
      .should('have.value', '');

    cy
      .get('.js-submit')
      .should('be.disabled');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .invoke('val', '1234')
      .trigger('input');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .should('have.value', '1')
      .next()
      .should('have.value', '2')
      .next()
      .should('have.value', '3')
      .next()
      .should('have.value', '4');

    cy
      .intercept('POST', '/api/outreach/auth', {
        delay: 100,
        body: {
          data: {
            id: '33333',
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .as('routeVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .should('be.disabled');

    cy
      .wait('@routeVerifyCodeRequest');

    cy
      .get('.form__title')
      .contains('Form Name');
  });

  specify('User verification - api error when creating new code', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        statusCode: 200,
        body: {
          data: {
            attributes: {
              phone_end: '1234',
            },
          },
        },
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/otp', {
        statusCode: 400,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click();

    cy
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('body')
      .contains('Uh-oh, there was an error. Try reloading the page.');
  });

  specify('User verification - user entered an invalid code', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        statusCode: 200,
        body: {
          data: {
            attributes: {
              phone_end: '1234',
            },
          },
        },
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/otp', {
        statusCode: 204,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click();

    cy
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .type('5678');

    cy
      .intercept('POST', '/api/outreach/auth', {
        statusCode: 403,
        delay: 100,
      })
      .as('routeVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .should('be.disabled');

    cy
      .wait('@routeVerifyCodeRequest');

    cy
      .get('.verify__code-fields')
      .find('.js-input.has-error')
      .should('have.length', 4)
      .first()
      .should('have.value', '')
      .next()
      .should('have.value', '')
      .next()
      .should('have.value', '')
      .next()
      .should('have.value', '');

    cy
      .get('.verify__error-text')
      .should('exist');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .type('1');

    cy
      .get('.verify__code-fields')
      .find('.js-input.has-error')
      .should('exist');

    cy
      .get('.verify__error-text')
      .should('exist');
  });

  specify('User verification - no longer shared error', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        statusCode: 404,
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .get('body')
      .contains('This form is no longer shared. Nothing else to do here.');
  });

  specify('User verification - form already submitted', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        statusCode: 409,
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .get('body')
      .contains('This form has already been submitted.');
  });

  specify('Form', function() {
    cy
      .intercept('GET', '/api/actions/11111/form', {
        body: {
          data: {
            id: '11111',
            type: 'forms',
            attributes: {
              name: 'Form Name',
            },
          },
        },
      })
      .as('routeFormAction')
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        body: {
          data: {
            id: '22222',
            type: 'outreach',
            attributes: {
              phone_end: '1234',
            },
          },
        },
      })
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/otp', {
        statusCode: 204,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click();

    cy
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .type('1234');

    cy
      .intercept('POST', '/api/outreach/auth', {
        delay: 100,
        body: {
          data: {
            type: 'patient-tokens',
            attributes: {
              token: 'token-success',
            },
          },
        },
      })
      .as('routeVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeVerifyCodeRequest')
      .wait('@routeFormAction')
      .wait('@routeFormActionFields')
      .wait('@routeFormActionDefinition');

    cy
      .get('.form__title')
      .contains('Form Name');

    cy
      .intercept('POST', '/api/actions/11111/relationships/form-responses', {
        statusCode: 400,
        delay: 100,
        body: {
          errors: [
            {
              id: '11111',
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
      .contains('Submit')
      .click()
      .wait('@postFormResponseError');

    cy
      .iframe()
      .find('.alert')
      .contains('This is a form error');

    cy
      .intercept('POST', '/api/actions/11111/relationships/form-responses', {
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
      .intercept('GET', '/api/actions/11111/form', {
        body: {
          data: {
            id: '11111',
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
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        body: {
          data: {
            id: '22222',
            type: 'outreach',
            attributes: {
              phone_end: '1234',
            },
          },
        },
      })
      .routeFormActionDefinition()
      .routeFormActionFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/otp', {
        statusCode: 204,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .type('1234');

    cy
      .intercept('POST', '/api/outreach/auth', {
        delay: 100,
        body: {
          data: {
            type: 'patient-tokens',
            attributes: {
              token: 'success-token',
            },
          },
        },
      })
      .as('routeVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeVerifyCodeRequest')
      .wait('@routeFormActionFields');

    cy
      .get('.form__title')
      .contains('Read-only Form');

    cy
      .get('[data-action-region]')
      .should('not.contain', 'Submit');

    cy
      .iframe()
      .as('iframe');

    cy
      .get('@iframe')
      .find('textarea[name="data[storyTime]"]')
      .should('have.value', 'Once upon a time...');
  });

  specify('500 error', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 500,
        });
      })
      .routeFormByAction()
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .url()
      .should('contain', 'outreach/500');

    cy
      .get('body')
      .contains('Uh-oh, there was an error.');

    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', {
        body: {
          data: {
            id: '22222',
            type: 'outreach',
            attributes: {
              phone_end: '1234',
            },
          },
        },
      });

    cy
      .get('body')
      .find('.js-try-again')
      .click();

    cy
      .url()
      .should('contain', 'outreach/11111');

    cy
      .intercept('POST', '/api/outreach/otp', {
        statusCode: 500,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .url()
      .should('contain', 'outreach/500');

    cy
      .get('body')
      .contains('Uh-oh, there was an error.');

    cy
      .get('body')
      .find('.js-try-again')
      .click();

    cy
      .intercept('POST', '/api/outreach/otp', {
        statusCode: 204,
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('.verify__code-fields')
      .find('.js-input')
      .first()
      .type('5678');

    cy
      .intercept('POST', '/api/outreach/auth', {
        statusCode: 500,
      })
      .as('routeVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeVerifyCodeRequest');

    cy
      .url()
      .should('contain', 'outreach/500');

    cy
      .get('body')
      .contains('Uh-oh, there was an error.');
  });

  specify('404 error', function() {
    cy
      .visit('/outreach', { noWait: true, isRoot: true });

    cy
      .get('body')
      .contains('Oops! The page you requested can\’t be found.');

    cy
      .visit('/outreach/', { noWait: true, isRoot: true });

    cy
      .get('body')
      .contains('Oops! The page you requested can\’t be found.');

    cy
      .visit('/outreach/11111/22222', { noWait: true, isRoot: true });

    cy
      .get('body')
      .contains('Oops! The page you requested can\’t be found.');
  });
});
