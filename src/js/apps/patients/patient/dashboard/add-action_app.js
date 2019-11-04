import $ from 'jquery';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { NoResultsView, ItemTemplate, AddTemplate, AddActionDroplist } from 'js/views/patients/patient/dashboard/add-action_views';

export default App.extend({
  beforeStart() {
    const d = $.Deferred();
    const fetchPrograms = Radio.request('entities', 'fetch:programs:collection');
    const fetchProgramActions = Radio.request('entities', 'fetch:programActions:all', { filter: 'published' });
    $.when(fetchPrograms, fetchProgramActions).done(([programs], programActions) => {
      d.resolve(Radio.request('entities', 'programs:collection', programs.filter({ published: true })));
    });
    return d.promise();
  },

  onStart(options, programs) {
    const lists = programs.map(program => {
      const headingText = program.get('name');
      const collection = program.getPublishedActions();

      if (!collection.length) {
        return {
          headingText,
          collection: new Backbone.Collection([{}]),
          childView: NoResultsView,
        };
      }

      return {
        headingText,
        collection,
        itemTemplate: ItemTemplate,
      };
    });

    // New Action
    lists.unshift({
      collection: new Backbone.Collection([{ id: 'new-action' }]),
      itemTemplate: AddTemplate,
      getItemSearchText() {
        return this.$el.text();
      },
    });

    this.showView(new AddActionDroplist({
      lists,
      picklistEvents: {
        'picklist:item:select': ({ model }) => {
          if (model.id === 'new-action') {
            this.triggerMethod('add:newAction');
            return;
          }

          this.triggerMethod('add:programAction', model);
        },
      },
    }));
  },
});
