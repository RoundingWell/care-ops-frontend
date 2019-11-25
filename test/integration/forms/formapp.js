context('Formapp', function() {
  specify('load basic form', function() {
    cy
      .server()
      .routeAction()
      .routeFormDefinition()
      .visit('/formapp/1/a/1')
      .wait('@routeAction')
      .wait('@routeFormDefinition');

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
      .get('textarea')
      .type('Here is some typing');

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
      .click()
      .then(() => {
        expect(reloadStub).to.have.been.calledOnce;
      });

    cy
      .wait('@routePostResponse')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.action.data.id).to.equal('1');
        expect(data.relationships.form.data.id).to.equal('1');
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
      .should('be.disabled');
  });
});
