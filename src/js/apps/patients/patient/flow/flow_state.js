import { clone, extend, keys, reduce } from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  defaults() {
    return {
      actionBeingEdited: null,
      lastSelectedIndex: null,
      selectedActions: {},
    };
  },
  isBeingEdited(model) {
    return this.get('actionBeingEdited') === model.id;
  },
  getSelectedList() {
    return this.get('selectedActions');
  },
  toggleSelected(model, isSelected, selectedIndex) {
    const currentSelectedList = clone(this.get('selectedActions'));
    const newSelectedList = extend(currentSelectedList, {
      [model.id]: isSelected,
    });

    this.set({
      selectedActions: newSelectedList,
      lastSelectedIndex: isSelected ? selectedIndex : null,
    });
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
    this.set({
      selectedActions: {},
      lastSelectedIndex: null,
    });

    this.trigger('select:none');
  },
  selectMultiple(selectedIds, newLastSelectedIndex = null) {
    const currentSelectedList = this.get('selectedActions');

    const newSelectedList = selectedIds.reduce((selected, id) => {
      selected[id] = true;
      return selected;
    }, clone(currentSelectedList));

    this.set({
      selectedActions: newSelectedList,
      lastSelectedIndex: newLastSelectedIndex,
    });

    this.trigger('select:multiple');
  },
});
