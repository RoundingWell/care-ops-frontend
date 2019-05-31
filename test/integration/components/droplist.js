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
    cy
      .get('.app-frame')
      .then($hook => {
        const region = new Region({
          el: $hook[0],
        });

        const droplist = new Droplist({
          headingText: 'Test Options',
          collection,
        });

        droplist.showIn(region);
      });

    cy
      .get('.app-frame')
      .contains('Choose One...')
      .click();
  });
});
