context('Outreach', function() {
  beforeEach(function() {
    cy.viewport('iphone-x');
  });

  specify('Opt In Success', function() {
    cy
      .visit('/outreach/opt-in', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach', {
        delay: 100,
        body: {
          data: {
            first_name: 'Test',
            last_name: 'Patient',
            birth_date: '1990-10-01',
            phone: '+18887771234',
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
      .intercept('POST', '/api/outreach', {
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

  specify('User verification - success', function() {
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
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        delay: 100,
        body: { data: {} },
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
            patientId: '1',
            opt: '1234',
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
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .routeFormActionDefinition()
      .routeFormActionFields()
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        delay: 100,
        body: { data: {} },
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
            patientId: '1',
            opt: '1234',
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
      .contains('Save')
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
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .routeFormActionDefinition()
      .routeFormActionFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        delay: 100,
        body: { data: {} },
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
            patientId: '1',
            opt: '1234',
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

  specify('General Error', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .routeFormActionDefinition()
      .routeFormActionFields()
      .routeFormByAction()
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        statusCode: 500,
        delay: 100,
        body: { data: {} },
      })
      .as('routeCreateVerifyCodeRequest');

    cy
      .get('.js-submit')
      .click()
      .wait('@routeCreateVerifyCodeRequest');

    cy
      .get('body')
      .contains('Uh-oh');
  });

  specify('Already Submitted', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        delay: 100,
        body: { data: {} },
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
        statusCode: 409,
        delay: 100,
        body: {
          data: {
            patientId: '1',
            opt: '1234',
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
      .wait('@routeVerifyCodeRequest');

    cy
      .get('body')
      .contains('This form has already been submitted.');
  });

  specify('Unavailable', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        delay: 100,
        body: { data: {} },
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
        statusCode: 403,
        delay: 100,
        body: {
          data: {
            patientId: '1',
            opt: '1234',
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
      .wait('@routeVerifyCodeRequest');

    cy
      .get('body')
      .contains('This form is no longer shared.');
  });

  specify('Not Found', function() {
    cy
      .intercept('GET', '/api/outreach?filter[action]=11111', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              attributes: {
                phone_end: '1234',
              },
              relationships: {
                patient: {
                  data: {
                    id: '1',
                  },
                },
              },
            },
          },
        });
      })
      .visit('/outreach/11111', { noWait: true, isRoot: true });

    cy
      .intercept('POST', '/api/outreach/1', {
        delay: 100,
        body: { data: {} },
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
        statusCode: 404,
        delay: 100,
        body: {
          data: {
            patientId: '1',
            opt: '1234',
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
      .wait('@routeVerifyCodeRequest');

    cy
      .get('body')
      .contains('This form is no longer shared.');
  });
});
