import { testDate } from 'helpers/test-date';

context('Formapp', function() {
  specify('load preview form', function() {
    cy
      .server()
      .routeFormDefinition()
      .visit('/formapp/1/preview', { noWait: true })
      .wait('@routeFormDefinition');

    cy
      .get('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .get('textarea[name="data[storyTime]"]')
      .type('Here is some typing');

    cy
      .get('button')
      .click();

    cy
      .get('.alert-danger')
      .should('contain', 'This form is for previewing only');
  });

  specify('load basic form', function() {
    cy
      .server()
      .routeAction()
      .routeFormDefinition()
      .routeFormFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/formapp/1/new/1/1', { noWait: true })
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    let reloadStub;

    cy
      .getRadio(Radio => {
        reloadStub = cy.stub();
        Radio.reply('forms', 'navigateResponse', reloadStub);
      });

    cy
      .get('body')
      .should('contain', 'Family Medical History');

    cy
      .get('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .get('textarea[name="data[storyTime]"]')
      .should('have.value', 'Once upon a time...');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/form-responses',
        response: { data: { id: '12345' } },
      })
      .as('routePostResponse');

    cy
      .get('button')
      .click();

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action.data.id).to.equal('1');
        expect(data.relationships.form.data.id).to.equal('1');
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.first_name).to.equal('John');
        expect(data.attributes.response.data.patient.last_name).to.equal('Doe');
        expect(data.attributes.response.data.patient.fields.weight).to.equal(192);
        expect(reloadStub).to.have.been.calledOnce.and.calledWith('1', '12345');
      });
  });

  specify('load form with response', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.relationships['form-responses'].data = [{ type: 'form-responses', id: '1' }];

        return fx;
      })
      .routeFormDefinition()
      .routeFormFields()
      .routeFormResponse(fx => {
        fx.data.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/formapp/1/new/1/1/1', { noWait: true })
      .wait('@routeFormDefinition')
      .wait('@routeFormFields')
      .wait('@routeFormResponse');

    let reloadStub;

    cy
      .getRadio(Radio => {
        reloadStub = cy.stub();
        Radio.reply('forms', 'navigateResponse', reloadStub);
      });

    cy
      .get('body')
      .should('contain', 'Family Medical History');

    cy
      .get('textarea[name="data[familyHistory]"]')
      .type('Here is some typing');

    cy
      .get('textarea[name="data[storyTime]"]')
      .should('have.value', 'Once upon a time...');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/form-responses',
        response: { data: { id: '12345' } },
      })
      .as('routePostResponse');

    cy
      .get('button')
      .click();

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action.data.id).to.equal('1');
        expect(data.relationships.form.data.id).to.equal('1');
        expect(data.attributes.response.data.storyTime).to.equal('Once upon a time...');
        expect(data.attributes.response.data.patient.first_name).to.equal('John');
        expect(data.attributes.response.data.patient.last_name).to.equal('Doe');
        expect(data.attributes.response.data.patient.fields.weight).to.equal(192);
        expect(reloadStub).to.have.been.calledOnce.and.calledWith('1', '12345');
      });
  });

  specify('load form response', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.relationships['form-responses'].data = [{ type: 'form-responses', id: '1' }];

        return fx;
      })
      .routeFormDefinition()
      .routeFormResponse()
      .visit('/formapp/1/response/1', { noWait: true })
      .wait('@routeFormDefinition')
      .wait('@routeFormResponse');

    cy
      .get('body')
      .should('contain', 'Family Medical History');

    cy
      .get('body')
      .should('contain', 'Here is some typing');

    cy
      .get('body')
      .find('textarea')
      .should('not.exist');

    cy
      .get('button')
      .should('not.be.visible');
  });

  specify('kitchen sink form', function() {
    cy
      .server()
      .fixture('test/form-kitchen-sink.json').as('fxTestFormKitchenSink')
      .route({
        url: '/api/forms/*/definition',
        response() {
          return this.fxTestFormKitchenSink;
        },
      })
      .as('routeFormKitchenSink')
      .routeFormFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/formapp/1/new/1/1', { noWait: true })
      .wait('@routeFormKitchenSink')
      .wait('@routeFormFields');

    cy
      .get('.formio-component')
      .as('formIOComponent')
      .find('input[type=text]')
      .first()
      .type('hello')
      .should('have.value', 'hello');

    cy
      .get('@formIOComponent')
      .find('input[type=checkbox]')
      .first()
      .click()
      .should('be.checked');

    cy
      .get('@formIOComponent')
      .find('input[type=radio]')
      .first()
      .click()
      .should('be.checked');

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__input--cloned')
      .first()
      .type('item 1{enter}item 2{enter}');

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__item')
      .first()
      .should('contain', 'item 1')
      .next()
      .should('contain', 'item 2')
      .find('button')
      .click();

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__inner .choices__item')
      .should('have.length', 1);

    cy
      .get('@formIOComponent')
      .find('.formio-component-datetime .input-group-text')
      .click();

    cy
      .get('.flatpickr-calendar')
      .find('.flatpickr-day.today')
      .click();

    cy
      .get('@formIOComponent')
      .find('.formio-component-datetime input[type=text]')
      .should('have.value', `${ testDate() } 12:00 PM`);
  });
});
