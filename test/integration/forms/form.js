import _ from 'underscore';
import { v5 as uuid } from 'uuid';

context('Noncontext Form', function() {
  beforeEach(function() {
    cy.routesForDefault();
  });

  specify('directory', function() {
    cy
      .intercept('GET', '/api/directory/foo*', {
        body: { data: { attributes: { value: ['one', 'two'] } } },
      })
      .as('routeDirectoryFoo')
      .intercept('GET', '/api/directory/bar*', {
        statusCode: 400,
        body: { data: { attributes: { value: ['bar', 'baz'] } } },
      })
      .as('routeDirectoryBar')
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.form.data = { id: '11111' };

        return fx;
      })
      .routeFormByAction(_.identity, '11111')
      .routeFormDefinition(fx => {
        return {
          display: 'form',
          components: [
            {
              label: 'Select Foo',
              widget: 'choicesjs',
              tableView: true,
              dataSrc: 'custom',
              data: {
                custom: 'values = getDirectory(\'foo\', { filter: { foo: \'bar\' }})',
              },
              template: '<span>{{ item }}</span>',
              refreshOn: 'data',
              key: 'select',
              type: 'select',
              input: true,
            },
            {
              label: 'Select Bar',
              widget: 'choicesjs',
              tableView: true,
              dataSrc: 'custom',
              data: {
                custom: `
                  values = getDirectory(\'bar\', { filter: { foo: \'bar\' }})
                    .catch(e => {
                      return ['bar', 'error'];
                    })
                `,
              },
              template: '<span>{{ item }}</span>',
              refreshOn: 'data',
              key: 'select2',
              type: 'select',
              input: true,
            },
          ],
        };
      })
      .routeFormActionFields()
      .routeFormResponse(fx => {
        fx.data.storyTime = 'Once upon a time...';

        return fx;
      })
      .routeActionActivity()
      .routePatientByAction(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeFormByAction')
      .wait('@routeAction')
      .wait('@routePatientByAction')
      .wait('@routeFormDefinition');

    cy
      .wait('@routeDirectoryBar')
      .wait('@routeDirectoryFoo')
      .itsUrl()
      .should(({ search, pathname }) => {
        expect(search).to.contain('?filter[foo]=bar');
        expect(pathname).to.equal('/api/directory/foo');
      });

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .first()
      .click();

    cy
      .iframe()
      .find('.choices__list--dropdown.is-active')
      .find('.choices__item--selectable')
      .first()
      .should('contain', 'one')
      .next()
      .should('contain', 'two')
      .click();

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .last()
      .click();

    cy
      .iframe()
      .find('.choices__list--dropdown.is-active')
      .find('.choices__item--selectable')
      .first()
      .should('contain', 'bar')
      .next()
      .should('contain', 'error');
  });

  specify('update patient field', function() {
    // NOTE: Needs an actual uuid for uuid v5 generation
    const patientId = '368a7fcf-c877-41bf-aefe-2ea4341cf9b4';
    cy
      .routePatient(fx => {
        fx.data.id = patientId;
        return fx;
      })
      .routePatientField(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'foo';
        fx.data.attributes.value = [1, 2];
        return fx;
      }, 'foo')
      .intercept('GET', `/api/patients/${ patientId }/fields/bar`, {
        statusCode: 400,
        body: { data: 'Error' },
      })
      .as('routePatientFieldbar')
      .intercept('PATCH', `/api/patients/${ patientId }/fields/foo`, {
        body: { data: { attributes: { name: 'foo', value: ['one', 'two'] } } },
      })
      .as('routePatchPatientFieldFoo')
      .intercept('PATCH', `/api/patients/${ patientId }/fields/bar`, {
        statusCode: 400,
        body: { data: 'Error' },
      })
      .as('routePatchPatientFieldBar')
      .routeFormDefinition(fx => {
        return {
          display: 'form',
          components: [
            {
              label: 'Test Get Field',
              action: 'custom',
              key: 'test1',
              type: 'button',
              input: true,
              custom: `
                getField('foo')
                  .then(value => {
                    data.opts = value;
                  });
              `,
            },
            {
              label: 'Test Get Error',
              action: 'custom',
              key: 'test2',
              type: 'button',
              input: true,
              custom: `
                getField('bar')
                  .catch(value => {
                    data.opts = ['error'];
                  });
              `,
            },
            {
              label: 'Test Update Field',
              action: 'custom',
              key: 'test3',
              type: 'button',
              input: true,
              custom: `
                updateField('foo', ['one', 'two'])
                  .then(value => {
                    data.opts = value;
                  });
              `,
            },
            {
              label: 'Test Update Error',
              action: 'custom',
              key: 'test4',
              type: 'button',
              input: true,
              custom: `
                updateField('bar', ['one', 'two'])
                  .catch(value => {
                    data.opts = ['error1', 'error2'];
                  });
              `,
            },
            {
              label: 'Select Foo',
              widget: 'choicesjs',
              tableView: true,
              dataSrc: 'custom',
              data: {
                custom: 'values = data.opts',
              },
              template: '<span>{{ item }}</span>',
              refreshOn: 'data',
              key: 'select',
              type: 'select',
              input: true,
            },
          ],
        };
      })
      .routeForm(_.identity, '11111')
      .routeFormFields()
      .visit(`/patient/${ patientId }/form/11111`)
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormFields')
      .wait('@routeFormDefinition');

    // NOTE: .wait(100) account for form.io data delays

    cy
      .iframe()
      .find('button')
      .contains('Test Get Field')
      .click()
      .wait('@routePatientFieldfoo')
      .wait(100);

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .click();

    cy
      .iframe()
      .find('.choices__list--dropdown.is-active')
      .find('.choices__item--selectable')
      .should('contain', '1')
      .should('contain', '2')
      .first()
      .click();

    cy
      .iframe()
      .find('button')
      .contains('Test Get Error')
      .click()
      .wait('@routePatientFieldbar')
      .wait(100);

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .click();

    cy
      .iframe()
      .find('.choices__list--dropdown.is-active')
      .find('.choices__item--selectable')
      .should('contain', 'error')
      .first()
      .click();

    cy
      .iframe()
      .find('button')
      .contains('Test Update Field')
      .click()
      .wait('@routePatchPatientFieldFoo')
      .its('request.body.data')
      .then(data => {
        expect(data.id).to.equal('1');
        expect(data.attributes.name).to.equal('foo');
        expect(data.attributes.value).to.deep.equal(['one', 'two']);
      })
      .wait(100);

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .click();

    cy
      .iframe()
      .find('.choices__list--dropdown.is-active')
      .find('.choices__item--selectable')
      .should('contain', 'one')
      .should('contain', 'two')
      .first()
      .click();

    cy
      .iframe()
      .find('button')
      .contains('Test Update Error')
      .click()
      .wait('@routePatchPatientFieldBar')
      .its('request.body.data.id')
      .should('equal', uuid('resource:field:bar', patientId))
      .wait(100);

    cy
      .iframe()
      .find('.formio-component-select .dropdown')
      .click();

    cy
      .iframe()
      .find('.choices__list--dropdown.is-active')
      .find('.choices__item--selectable')
      .should('contain', 'error')
      .first()
      .click();
  });

  specify('form scripts and reducers', { retries: 4 }, function() {
    cy
      .intercept('GET', '/appconfig.json', {
        body: { versions: { frontend: 'foo' } },
      })
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeForm(_.identity, '33333')
      .routeFormDefinition()
      .routeFormFields()
      .visit('/patient/1/form/33333')
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormFields')
      .wait('@routeFormDefinition');

    cy
      .iframe()
      .find('textarea[name="data[storyTime]"]')
      .should('contain', 'foo');
  });

  specify('form reducer error', function() {
    cy
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeForm(_.identity, '44444')
      .routeFormDefinition()
      .routeFormFields()
      .visit('/patient/1/form/44444')
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormFields')
      .wait('@routeFormDefinition');

    cy
      .get('iframe')
      .its('0.contentWindow')
      .should('not.be.empty')
      .then(win => {
        cy
          .stub(win.console, 'error')
          .as('consoleError');

        // Query for the iframe body to ensure it's loaded
        cy
          .iframe()
          .find('textarea[name="data[familyHistory]"]');

        cy
          .get('@consoleError')
          .should('be.calledOnce');
      });
  });
});
