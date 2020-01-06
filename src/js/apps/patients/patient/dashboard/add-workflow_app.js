import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { NoResultsView, ItemTemplate, AddTemplate, AddWorkflowDroplist } from 'js/views/patients/patient/dashboard/add-workflow_views';

export default App.extend({
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:programs:collection'),
      Radio.request('entities', 'fetch:programActions:collection'),
      Radio.request('entities', 'fetch:programFlows:collection'),
    ];
  },
  onStart(options, [programs]) {
    programs.reset(programs.filter({ published: true }));

    const lists = programs.map(program => {
      const headingText = program.get('name');
      const collection = program.getPublished();

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
        itemTemplateContext() {
          const isProgramAction = this.model.type === 'program-actions';
          const iconType = (isProgramAction) ? 'file-alt' : 'folder';

          return {
            iconType,
            isFar: isProgramAction,
          };
        },
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

    this.showView(new AddWorkflowDroplist({
      lists,
      picklistEvents: {
        'picklist:item:select': ({ model }) => {
          if (model.id === 'new-action') {
            this.triggerMethod('add:newAction');
            return;
          }

          if (model.type === 'program-actions') {
            this.triggerMethod('add:programAction', model);
          }

          if (model.type === 'program-flows') {
            this.triggerMethod('add:programFlow', model);
          }
        },
      },
    }));
  },
});
