context('Alert Service', function() {
  specify('Displaying', function() {
    cy
      .visit('/');

    cy
      .clock();

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

    cy
      .clock()
      .then(clock => {
        clock.restore();
      });

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
      .contains('error');

    const options = {
      onUndo: cy.stub(),
      onComplete: cy.stub(),
    };

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:undo', options);
      });

    cy
      .get('.alert-box')
      .find('.js-dismiss')
      .click()
      .then(() => {
        expect(options.onComplete).to.be.calledOnce;
      });

    cy
      .getRadio(Radio => {
        Radio.request('alert', 'show:undo', options);
      });

    cy
      .get('.alert-box')
      .find('.js-undo')
      .click()
      .then(() => {
        expect(options.onUndo).to.be.calledOnce;
      });
  });
});
