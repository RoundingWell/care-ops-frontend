import _ from 'underscore';

context('Noncontext Form', function() {
  beforeEach(function() {
    cy.routesForDefault();
  });

  specify('directory', function() {
    cy
      .route({
        method: 'GET',
        url: '/appconfig.json',
        response: { versions: { frontend: 'foo' } },
      })
      .route({
        method: 'GET',
        url: '/api/directory/foo*',
        response: { data: { attributes: { value: ['one', 'two'] } } },
      })
      .as('routeDirectoryFoo')
      .route({
        method: 'GET',
        url: '/api/directory/bar*',
        response: { data: { attributes: { value: ['bar', 'baz'] } } },
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
                custom: 'values = getDirectory(\'bar\', { filter: { foo: \'bar\' }})',
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
      .should('contain', 'baz');
  });

  specify('update patient field', function() {
    cy
      .route({
        method: 'PATCH',
        url: '/api/patients/1/fields/foo',
        response: { data: { attributes: { name: 'foo', value: ['one', 'two'] } } },
      })
      .as('routePatchPatientFieldFoo')
      .route({
        method: 'PATCH',
        url: '/api/patients/1/fields/bar',
        status: 400,
        response: { data: 'Error' },
      })
      .as('routePatchPatientFieldBar')
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
                custom: 'values = updateField(\'foo\', [\'one\', \'two\'])',
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
                custom: 'values = new Promise(resolve => { updateField(\'bar\', [\'bar\', \'baz\']).then(v => { resolve(v); }).catch(e => { resolve([e]); }) });',
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
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeForm(_.identity, '11111')
      .routeFormFields()
      .visit('/patient/1/form/11111')
      .wait('@routePatient')
      .wait('@routeForm')
      .wait('@routeFormFields')
      .wait('@routeFormDefinition');

    cy
      .wait('@routePatchPatientFieldFoo')
      .wait('@routePatchPatientFieldBar')
      .its('request.body.data.attributes')
      .should('deep.equal', { name: 'bar', value: ['bar', 'baz'] });

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
      .should('contain', 'Error: Bad Request');
  });

  specify('form scripts and reducers', { retries: 4 }, function() {
    cy
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
