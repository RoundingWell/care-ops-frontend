import 'js/base/setup';
import Backbone from 'backbone';
import { Region } from 'marionette';

context('Droplist', function() {
  const collection = new Backbone.Collection([
    { text: 'Option 1' },
    { text: 'Option 2' },
    { text: 'Option 3' },
  ]);

  beforeEach(function() {
    cy
      .visitComponent('Droplist');

    // Set View prototype to window's BB for instanceOf checks
    cy
      .window()
      .its('Backbone')
      .then(winBackbone => {
        Backbone.View = winBackbone.View;
      });
  });

  specify('Displaying', function() {
    const headingText = 'Test Options';
    const Droplist = this.Droplist;
    let droplist;

    cy
      .getHook($hook => {
        const region = new Region({
          el: $hook[0],
        });

        droplist = new Droplist({
          picklistOptions: {
            headingText,
          },
          collection,
          state: { isDisabled: true },
        });

        droplist.showIn(region);
      });

    cy
      .get('@hook')
      .contains('Choose One...')
      .should('be.disabled')
      .then(() => {
        droplist.setState({ isDisabled: false });
      });

    cy
      .get('@hook')
      .contains('Choose One...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .contains(headingText);

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .get('@hook')
      .contains('Option 1')
      .then(() => {
        droplist.setState({ selected: null });
      });

    cy
      .get('@hook')
      .contains('Choose One...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .last()
      .click();

    cy
      .get('@hook')
      .contains('Option 3')
      .click();

    cy
      .get('body')
      .type('{esc}');

    cy
      .get('.picklist')
      .should('not.exist');
  });

  specify('isSelectlist', function() {
    let selectlist;
    const Droplist = this.Droplist;

    cy
      .getHook($hook => {
        const $div = $hook.append('<div style="position: absolute; bottom: 20px; right: 20px;"></div>');

        const region = new Region({
          el: $div[0],
        });

        selectlist = new Droplist({
          picklistOptions: {
            headingText: 'Test Options Very very long title',
            isSelectlist: true,
          },
          collection,
        });

        selectlist.showIn(region);
      });

    cy
      .get('@hook')
      .contains('Choose One...')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .get('@hook')
      .contains('Option 1')
      .click();

    cy
      .get('.picklist__input')
      .type('Opt 3');

    cy
      .get('.picklist__item')
      .last()
      .should('have.html', '<strong>Opt</strong>ion <strong>3</strong>');

    cy
      .get('.picklist__input')
      .type('{enter}');

    cy
      .get('@hook')
      .contains('Option 3')
      .click();

    cy
      .get('body')
      .type('{esc}');

    cy
      .get('.picklist')
      .should('not.exist');
  });
});
