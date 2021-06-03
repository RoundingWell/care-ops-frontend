import { bind, noop } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { AddButtonView, i18n, itemClasses } from 'js/views/patients/shared/add-workflow/add-workflow_views';

const optEvents = {
  'program-actions': 'add:programAction',
  'program-flows': 'add:programFlow',
  'new': 'add:newAction',
};

export default App.extend({
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:programs:collection'),
      Radio.request('entities', 'fetch:programActions:collection'),
      Radio.request('entities', 'fetch:programFlows:collection'),
    ];
  },
  onStart(options, [programs]) {
    programs.comparator = 'name';
    programs.reset(programs.filter({ published: true }));

    this.showView(new AddButtonView({
      lists: this.getLists(programs),
    }));
  },
  getLists(programs) {
    const lists = this.getProgramsOpts(programs);

    const newActionOpt = {
      type: 'program-actions',
      text: i18n.newActionText,
      onSelect: bind(this.triggerMethod, this, optEvents.new),
    };

    lists.unshift({
      collection: new Backbone.Collection([newActionOpt]),
      itemClassName: itemClasses.new,
    });

    return lists;
  },
  getProgramsOpts(programs) {
    return programs.map(program => {
      const headingText = program.get('name');
      const programItems = program.getPublished();
      const noResultsOpt = {
        type: 'program-actions',
        text: i18n.noResultsText,
      };

      if (!programItems.length) {
        return {
          itemClassName: itemClasses.noResults,
          headingText,
          collection: new Backbone.Collection([noResultsOpt]),
          getItemSearchText: noop,
        };
      }

      const itemsOpts = this.getProgramItemsOpts(programItems);

      return {
        headingText,
        collection: new Backbone.Collection(itemsOpts),
      };
    });
  },
  getProgramItemsOpts(programItems) {
    return programItems.map(item => {
      return {
        text: item.get('name'),
        type: item.type,
        onSelect: bind(this.triggerMethod, this, optEvents[item.type], item),
      };
    });
  },
});
