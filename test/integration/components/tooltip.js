import 'js/base/setup';
import Backbone from 'backbone';
import { View, CollectionView, Region } from 'marionette';

import hbs from 'handlebars-inline-precompile';

context('Tooltip', function() {
  let Tooltip;

  const testCollection = new Backbone.Collection([
    { id: 'Top Left', style: 'left: 5px; top: 5px' },
    { id: 'Top Center', style: 'left: 45%; top: 5px' },
    { id: 'Top Right', style: 'right: 5px; top: 5px' },
    { id: 'Bottom Left', style: 'left: 5px; bottom: 5px' },
    { id: 'Bottom Center', style: 'left: 45%; bottom: 5px' },
    { id: 'Bottom Right', style: 'right: 5px; bottom: 5px' },
    { id: 'Center Left', style: 'top: 45%; left: 5px' },
    { id: 'Center Right', style: 'top: 45%; right: 5px;' },
  ]);

  const ButtonView = View.extend({
    template: hbs`<button class="button--blue" style="position:absolute; width:10%; height:10%; {{ style }}">{{ id }}</button>`,
    ui: {
      'button': 'button',
    },
    onRender() {
      new Tooltip({
        message: this.model.id,
        uiView: this,
        ui: this.ui.button,
        orientation: this.getOption('orientation'),
      });
    },
  });

  const TestView = CollectionView.extend({
    initialize() {
      this.render();
    },
    childView: ButtonView,
    collection: testCollection,
  });

  beforeEach(function() {
    cy
      .visitComponent(Components => {
        Tooltip = Components.Tooltip;
      });
  });

  specify('Displaying vertical positioning', function() {
    cy
      .getHook($hook => {
        new TestView({ el: $hook[0] });
      });

    testCollection.each(model => {
      cy
        .get('@hook')
        .contains(model.id)
        .as('button')
        .trigger('mouseover');

      cy
        .get('.tooltip')
        .contains(model.id);

      cy
        .get('@button')
        .trigger('mouseout');
    });
  });

  specify('Displaying horizontal positioning', function() {
    cy
      .getHook($hook => {
        new TestView({
          el: $hook[0],
          childViewOptions: { orientation: 'horizontal' },
        });
      });

    testCollection.each(model => {
      cy
        .get('@hook')
        .contains(model.id)
        .as('button')
        .trigger('mouseover');

      cy
        .get('.tooltip')
        .contains(model.id);

      cy
        .get('@button')
        .trigger('mouseout');
    });
  });

  specify('Manual trigger', function() {
    const ManualTestView = View.extend({
      tagName: 'button',
      attributes: {
        style: 'margin: 20px;',
      },
      className: 'button--blue',
      template: hbs`Click Me`,
      triggers: {
        'click': 'click',
      },
      onRender() {
        this.tooltip = new Tooltip({
          messageHtml: '<strong>Clicked</strong> it',
          uiView: this,
          ignoreEl: this.el,
        });
      },
      onClick() {
        this.tooltip.getView() ? this.tooltip.hideTooltip() : this.tooltip.showTooltip();
      },
    });

    cy
      .getHook($hook => {
        const region = new Region({ el: $hook[0] });
        region.show(new ManualTestView());
      });

    cy
      .get('@hook')
      .contains('Click Me')
      .click();

    cy
      .get('.tooltip')
      .contains('Clicked it');

    cy
      .get('@hook')
      .contains('Click Me')
      .click();

    cy
      .get('.tooltip')
      .should('not.exist');

    cy
      .get('@hook')
      .contains('Click Me')
      .click();

    cy
      .get('.tooltip')
      .contains('Clicked it');

    cy
      .get('@hook')
      .click('center');

    cy
      .get('.tooltip')
      .should('not.exist');

    cy
      .get('@hook')
      .contains('Click Me')
      .click();

    cy
      .get('.tooltip')
      .contains('Clicked it');

    cy
      .viewport(1234, 567);

    cy
      .get('.tooltip')
      .should('not.exist');
  });
});
