import { extend, keys, reduce } from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  defaults() {
    return {
      actionBeingEdited: null,
      selectedActions: {},
    };
  },
  isBeingEdited(model) {
    return this.get('actionBeingEdited') === model.id;
  },
  getSelectedList() {
    return this.get('selectedActions');
  },
  toggleSelected(model, isSelected) {
    this.set('selectedActions', extend({}, this.get('selectedActions'), {
      [model.id]: isSelected,
    }));
  },
  isSelected(model) {
    const list = this.getSelectedList();

    return !!list[model.id];
  },
  getSelected(collection) {
    const list = this.getSelectedList();
    const collectionSelected = reduce(keys(list), (selected, item) => {
      if (list[item] && collection.get(item)) {
        selected.push({
          id: item,
        });
      }

      return selected;
    }, []);

    return Radio.request('entities', 'actions:collection', collectionSelected);
  },
  clearSelected() {
    this.set('selectedActions', {});
    this.trigger('select:none');
  },
  selectAll(collection) {
    const list = collection.reduce((selected, model) => {
      selected[model.id] = true;
      return selected;
    }, {});

    this.set('selectedActions', list);

    this.trigger('select:all');
  },
});
