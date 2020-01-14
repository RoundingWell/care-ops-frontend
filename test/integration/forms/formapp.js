context('Formapp', function() {
  specify('load basic form', function() {
    cy
      .server()
      .routeAction()
      .routeFormDefinition()
      .routeFormFields(fx => {
        fx.data.attributes.storyTime = 'Once upon a time...';

        return fx;
      })
      .visit('/formapp/1/a/1')
      .wait('@routeAction')
      .wait('@routeFormDefinition')
      .wait('@routeFormFields');

    let reloadStub;

    cy
      .getRadio(Radio => {
        reloadStub = cy.stub();
        Radio.reply('forms', 'reload', reloadStub);
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
        response: {},
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
        expect(reloadStub).to.have.been.calledOnce;
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
      .visit('/formapp/1/a/1')
      .wait('@routeAction')
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
      .should('not.exist');
  });
});
