import 'js/base/setup';
import Backbone from 'backbone';
import { Region } from 'marionette';

context('Selectlist', function() {
  let Selectlist;

  const collection = new Backbone.Collection([
    { text: 'Option 1' },
    { text: 'Option 2' },
    { text: 'Option 3' },
  ]);

  beforeEach(function() {
    cy
      .visitComponent(Components => {
        Selectlist = Components.Selectlist;
        Selectlist.prototype.disableInput = false;
      });

    // Set View prototype to window's BB for instanceOf checks
    cy
      .window()
      .should('have.property', 'Backbone')
      .then(winBackbone => {
        Backbone.View = winBackbone.View;
      });
  });

  specify('Displaying', function() {
    let selectlist;
    cy
      .getHook($hook => {
        $hook.width(200);
        const region = new Region({
          el: $hook[0],
        });

        selectlist = new Selectlist({
          viewOptions: {
            attributes: {
              style: 'position: absolute; bottom: 20px; right: 20px;',
            },
          },
          picklistOptions: {
            headingText: 'Test Options Very very long title',
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
      .get('.input--general')
      .type('Opt 3');

    cy
      .get('.picklist__item')
      .last()
      .should('have.html', '<a><strong>Opt</strong>ion <strong>3</strong></a>');

    cy
      .get('.input--general')
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
