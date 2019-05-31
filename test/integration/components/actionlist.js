import 'js/base/setup';
import Backbone from 'backbone';
import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

context('Actionlist', function() {
  let Actionlist;

  const TestView = View.extend({
    initialize() {
      this.render();
    },
    template: hbs`<button class="button--blue u-margin--t u-margin--l">Test Menu</button>`,
    ui: {
      button: 'button',
    },
    triggers: {
      'click button': 'click',
    },
    dateState: {},
    onClick() {
      const actionlist = new Actionlist({
        ui: this.ui.button,
        uiView: this,
        lists: [{ collection: this.collection }],
      });

      actionlist.show();
    },
  });

  beforeEach(function() {
    cy
      .visit('/');

    cy
      .window()
      .should('have.property', 'Components')
      .then(Components => {
        Actionlist = Components.Actionlist;
      });
  });

  specify('Displaying', function() {
    const collection = new Backbone.Collection([
      {
        text: 'Test 1',
        onSelect() {
          console.log('test this');
        },
      },
      {
        text: 'Test 2',
        isDisabled: true,
        hasDivider: true,
      },
    ]);

    cy
      .get('.app-frame')
      .then($hook => {
        new TestView({
          el: $hook[0],
          collection,
        });
      });

    cy
      .get('.app-frame')
      .contains('Test Menu')
      .click();
  });
});
