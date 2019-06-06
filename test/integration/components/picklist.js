import 'js/base/setup';
import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { Region } from 'marionette';

import Picklist from 'js/components/picklist';

function makeItem(num) {
  return {
    text: `This is an item: ${ num }`,
  };
}

context('Picklist', function() {
  let region;

  const lists = [
    {
      childViewEventPrefix: 'group1',
      collection: new Backbone.Collection([makeItem(1), makeItem(2), makeItem(3)]),
    },
    {
      childViewEventPrefix: 'group2',
      collection: new Backbone.Collection([makeItem(1), makeItem(4)]),
      headingText: 'Group 2',
    },
  ];

  specify('Displaying a list', function() {
    let picklist;
    const onClose = cy.stub();
    const onSelect1 = cy.stub();
    const onSelect2 = cy.stub();

    cy
      .visit('/');

    // Proxy module Radio to App Radio
    cy
      .getRadio(AppRadio => {
        const model = new Backbone.Model();
        model.listenTo(AppRadio.channel('user-activity'), 'document:keydown', evt => {
          Radio.trigger('user-activity', 'document:keydown', evt);
        });
      });

    cy
      .getHook($hook => {
        region = new Region({ el: $hook[0] });
        picklist = new Picklist({
          lists,
          region,
          headingText: 'Test Picklist',
          noResultsText: 'No results',
          viewEvents: {
            'close': onClose,
            'picklist:group1:select': onSelect1,
            'picklist:group2:select': onSelect2,
          },
        });

        picklist.show();

        picklist.setState('query', 'this item');
      });

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .trigger('mouseover')
      .should('have.class', 'is-highlighted');

    cy
      .get('body')
      .type('{downarrow}{downarrow}');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .next()
      .next()
      .should('have.class', 'is-highlighted');

    cy
      .get('body')
      .type('{uparrow}');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .next()
      .should('have.class', 'is-highlighted');

    // Reset highlight
    cy
      .get('.picklist')
      .then(() => {
        picklist.show();
      });

    // It should not transport past the start of the list
    cy
      .get('body')
      .type('{uparrow}{downarrow}{downarrow}{downarrow}{uparrow}{uparrow}{uparrow}{uparrow}{uparrow}');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .should('have.class', 'is-highlighted');

    // Reset highlight
    cy
      .get('.picklist')
      .then(() => {
        picklist.show();
      });

    // It should not transport past the end of the list
    cy
      .get('body')
      .type('{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}{downarrow}');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .last()
      .should('have.class', 'is-highlighted');

    cy
      .get('body')
      .type('{downarrow}{uparrow}{uparrow}');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .trigger('mouseover')
      .should('have.class', 'is-highlighted');

    cy
      .get('body')
      .type('{esc}')
      .then(() => {
        expect(onClose).to.be.calledOnce;
        onClose.resetHistory();
      });

    cy
      .get('.picklist')
      .trigger('keydown', { which: _.TAB_KEY })
      .then(() => {
        expect(onClose).to.be.calledOnce;
        onClose.resetHistory();
      });

    cy
      .get('.picklist')
      .find('.picklist__item')
      .last()
      .trigger('mouseover');

    cy
      .get('body')
      .type('{enter}')
      .then(() => {
        expect(onSelect2).to.be.calledOnce;
        onSelect2.resetHistory();
      });

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .trigger('mouseover')
      .click()
      .then(() => {
        expect(onSelect1).to.be.calledOnce;
        onSelect1.resetHistory();
      });
  });
});
