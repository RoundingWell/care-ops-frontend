import 'js/base/setup';
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
      .get('.app-frame')
      .then($hook => {
        region = new Region({ el: $hook[0] });
        picklist = new Picklist({
          lists,
          region,
          headingText: 'Test Picklist',
          noResultsText: 'No results',
        });

        picklist.show();

        picklist.setState('query', 'this item');
      });

    cy
      .get('.picklist');
  });
});
