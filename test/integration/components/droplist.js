import 'js/base/setup';
import Backbone from 'backbone';
import { Region } from 'marionette';

context('Droplist', function() {
  let Droplist;

  const collection = new Backbone.Collection([
    { text: 'Option 1' },
    { text: 'Option 2' },
    { text: 'Option 3' },
  ]);

  beforeEach(function() {
    cy
      .visit('/');

    // Set View prototype to window's BB for instanceOf checks
    cy
      .window()
      .should('have.property', 'Backbone')
      .then(winBackbone => {
        Backbone.View = winBackbone.View;
      });

    cy
      .window()
      .should('have.property', 'Components')
      .then(Components => {
        Droplist = Components.Droplist;
      });
  });

  specify('Displaying', function() {
    const headingText = 'Test Options';
    let droplist;

    cy
      .getHook($hook => {
        const region = new Region({
          el: $hook[0],
        });

        droplist = new Droplist({
          headingText,
          collection,
        });

        droplist.showIn(region);
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
});
