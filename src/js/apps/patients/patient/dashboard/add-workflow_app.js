import { bind, noop } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { AddButtonView, i18n, itemClasses } from 'js/views/patients/shared/add-workflow/add-workflow_views';

const optEvents = {
  'program-actions': 'add:programAction',
  'program-flows': 'add:programFlow',
};

export default App.extend({
  beforeStart() {
    return [
      Radio.request('entities', 'fetch:programs:collection'),
      Radio.request('entities', 'fetch:programActions:collection'),
      Radio.request('entities', 'fetch:programFlows:collection'),
    ];
  },
  onStart(options, programs) {
    programs.comparator = 'name';

    const addablePrograms = programs.filter(program => {
      const isPublished = !!program.get('published_at');
      const isArchived = !!program.get('archived_at');

      return isPublished && !isArchived;
    });

    programs.reset(addablePrograms);

    this.showView(new AddButtonView({
      lists: this.getProgramsOpts(programs),
    }));
  },
  getProgramsOpts(programs) {
    return programs.map(program => {
      const headingText = program.get('name');
      const programItems = program.getAddable();
      const noResultsOpt = {
        itemType: 'program-actions',
        text: i18n.noResultsText,
        isDisabled: true,
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
        itemType: item.type,
        hasOutreach: item.type === 'program-actions' && item.hasOutreach(),
        onSelect: bind(this.triggerMethod, this, optEvents[item.type], item),
      };
    });
  },
});
