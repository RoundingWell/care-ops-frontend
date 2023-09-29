context('Alert Service', function() {
  specify('Displaying', function() {
    cy
      .clock();

    cy
      .routesForDefault()
      .visit();

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:info', 'info');
      });

    cy
      .get('.alert-box')
      .contains('info');

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:error', 'error');
      });

    cy
      .get('.alert-box')
      .contains('error')
      // 4000 alert delay + 900 animation fade
      .tick(4900);

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:apiError', {
          errors: [
            {
              detail: 'API error 1',
            },
            {
              detail: 'API error 2',
            },
          ],
        });
      });

    cy
      .get('.alert-box')
      .first()
      .should('contain', 'API error 1')
      .next()
      .should('contain', 'API error 2');

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:success', 'success');
      });

    cy
      .get('.alert-box')
      .contains('success')
      // 4000 alert delay + 900 animation fade
      .tick(4900);

    cy
      .get('.alert-box')
      .should('not.exist');
  });

  specify('Closing via dismiss button', function() {
    const onComplete = cy.stub();

    cy
      .clock();

    cy
      .routesForDefault()
      .visit();

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:undo', { onComplete });
      });

    cy
      .get('.alert-box')
      .find('.js-dismiss')
      .click()
      .click()
      .then(() => {
        expect(onComplete).to.be.calledOnce;
      })
      .tick(1000);

    cy
      .get('.alert-box')
      .should('not.exist');
  });

  specify('Closing via undo button', function() {
    const onUndo = cy.stub();

    cy
      .clock();

    cy
      .routesForDefault()
      .visit();

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:undo', { onUndo });
      });

    cy
      .get('.alert-box')
      .find('.js-undo')
      .click()
      .then(() => {
        expect(onUndo).to.be.calledOnce;
      })
      .tick(1000);

    cy
      .get('.alert-box')
      .should('not.exist');
  });
});
