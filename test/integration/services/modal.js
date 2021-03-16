context('Modal Service', function() {
  const smallOnTall = () => {
    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show:tall', {
          headingText: 'Tall Modal Header',
          bodyText: 'Tall Modal, which is under the small modal.',
        });
      });

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show:small', {
          headingText: 'Small Modal Header',
          bodyText: 'Small Modal, this guy shows over the top of the tall modal.',
        });
      });
  };

  specify('Displaying', function() {
    const buttonStub = cy.stub();
    cy
      .visit('/');

    smallOnTall();

    cy
      .get('.modal--small')
      .should('contain', 'Small Modal')
      .find('.modal__footer')
      .find('.js-close')
      .click();

    cy
      .get('.modal--tall')
      .should('contain', 'Tall Modal')
      .find('.modal__footer')
      .find('.js-close')
      .click();

    // Close using the X icon
    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show:small', {
          headingText: 'Small Modal Header',
          bodyText: 'Small Modal',
          onCancel: buttonStub,
        });
      });

    cy
      .get('.modal--small')
      .find('.modal__close')
      .click()
      .then(() => {
        expect(buttonStub).to.be.calledOnce;
        buttonStub.resetHistory();
      });

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show:small', {
          headingText: 'Close On Save',
          bodyText: 'Default onSave behavior. Also a cool custom class!',
          buttonClass: 'save-button',
          className: 'modal--small custom-class',
        });
      });

    cy
      .get('.modal--small')
      .should('have.class', 'custom-class')
      .find('.save-button')
      .click();

    cy
      .get('.modal--small')
      .should('not.exist');

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show', {
          footerView: false,
          bodyText: 'No Footer',
        });
      });

    cy
      .get('.modal')
      .then(modal => {
        expect(modal).to.not.have.class('modal__footer');
      });

    cy
      .getRadio(Radio => {
        const modal = Radio.request('modal', 'show', {
          bodyText: 'Submit Disabled',
          onSubmit: () => {
            modal.disableSubmit(true);
          },
        });
      });

    cy
      .get('.modal')
      .find('.js-submit')
      .click()
      .should('be.disabled');

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show', {
          onSubmit: buttonStub,
        });
      });

    cy
      .get('.modal')
      .find('.js-submit')
      .click()
      .then(() => {
        expect(buttonStub).to.be.calledOnce;
        buttonStub.resetHistory();
      });

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show', {
          onCancel: buttonStub,
        });
      });

    cy
      .get('.modal')
      .find('.js-close')
      .last() // Close Button
      .click()
      .then(() => {
        expect(buttonStub).to.be.calledOnce;
        buttonStub.resetHistory();
      });

    smallOnTall();

    // click the overlay, tall should stll be there
    cy
      .get('.fill-window--dark')
      .last()
      .click('left')
      .get('.modal--small')
      .should('not.exist');

    cy
      .get('.modal--tall')
      .contains('Tall Modal')
      .get('.fill-window--dark')
      .click('left')
      .get('.modal--tall')
      .should('not.exist');

    cy
      .getRadio(Radio => {
        const modal = Radio.request('modal', 'show', {
          bodyText: 'Hi',
        });
        modal.startPreloader();
      });

    cy
      .get('.spinner')
      .get('.fill-window--dark')
      .click('right');

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show', {
          headerView: 'Custom Header',
          bodyView: 'Custom Body',
          footerView: 'Custom Footer',
        });
      });

    cy
      .get('.modal__header')
      .contains('Custom Header');

    cy
      .get('.modal__body')
      .contains('Custom Body');

    cy
      .get('.modal')
      .contains('Custom Footer');

    cy
      .get('.modal')
      .find('.js-close')
      .click();

    cy
      .getRadio(Radio => {
        Radio.request('modal', 'show:sidebar', {
          headingText: 'Sidebar Modal Header',
          bodyText: 'Sidebar Modal, this guy is anchored to the right side of the window.',
        });
      });

    cy
      .get('.modal--sidebar')
      .find('.modal__header')
      .should('contain', 'Sidebar Modal Header')
      .next()
      .find('.sidebar')
      .should('contain', 'Sidebar Modal, this guy is anchored to the right side of the window.');

    cy
      .get('.modal--sidebar')
      .find('.js-close')
      .first()
      .click();

    cy
      .get('.modal--sidebar')
      .should('not.exist');
  });
});
