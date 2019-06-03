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
    const onSelect = cy.stub();
    const collection = new Backbone.Collection([
      {
        text: 'Test 1',
        onSelect,
      },
      {
        text: 'Test 2',
        isDisabled: true,
        hasDivider: true,
      },
      {
        text: 'Test 3',
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

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click()
      .then((picklistItem) => {
        expect(onSelect).to.be.calledOnce;
        expect(picklistItem).to.not.exist;
        onSelect.resetHistory();
      });

    cy
      .get('.app-frame')
      .contains('Test Menu')
      .click();

    cy
      .get('.picklist')
      .find('.is-disabled')
      .first()
      .click()
      .then((picklistItem) => {
        expect(onSelect).to.not.be.called;
        expect(picklistItem).to.exist;
      });

    cy
      .get('.app-frame')
      .contains('Test Menu')
      .click();

    cy
      .get('.app-frame')
      .click('right');

    cy
      .get('.picklist')
      .should('not.exist');
  });
});
