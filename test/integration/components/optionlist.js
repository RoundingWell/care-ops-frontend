import 'js/base/setup';
import Backbone from 'backbone';
import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

context('Optionlist', function() {
  const TestView = View.extend({
    initialize() {
      this.render();
    },
    template: hbs`<button class="button--blue u-margin--t-16 u-margin--l-16">Test Menu</button>`,
    ui: {
      button: 'button',
    },
    triggers: {
      'click button': 'click',
    },
    dateState: {},
    onClick() {
      const Optionlist = this.getOption('Optionlist');
      const optionlist = new Optionlist({
        ui: this.ui.button,
        uiView: this,
        lists: [{ collection: this.collection }],
      });

      optionlist.show();
    },
  });

  beforeEach(function() {
    cy
      .visitComponent('Optionlist');
  });

  specify('Displaying', function() {
    const Optionlist = this.Optionlist;

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
    ]);

    cy
      .getHook($hook => {
        new TestView({
          el: $hook[0],
          collection,
          Optionlist,
        });
      });

    cy
      .get('@hook')
      .contains('Test Menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click()
      .then(picklistItem => {
        expect(onSelect).to.be.calledOnce;
        expect(picklistItem).to.not.exist;
        onSelect.resetHistory();
      });

    cy
      .get('@hook')
      .contains('Test Menu')
      .click();

    cy
      .get('.picklist')
      .find('.is-disabled')
      .first()
      .click()
      .then(picklistItem => {
        expect(onSelect).to.not.be.called;
        expect(picklistItem).to.exist;
      });

    cy
      .get('@hook')
      .contains('Test Menu')
      .click();

    cy
      .get('body')
      .type('{esc}');

    cy
      .get('.picklist')
      .should('not.exist');
  });
});
