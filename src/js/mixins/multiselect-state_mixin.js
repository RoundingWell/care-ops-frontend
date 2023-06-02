import { clone, keys, reduce } from 'underscore';

import Radio from 'backbone.radio';

// Note: Requires a `getType` method to be defined on the model returning the entity name

export default {
  setSelectedList(list, lastSelectedIndex) {
    return this.set({
      [`${ this.getType() }Selected`]: list,
      lastSelectedIndex,
    });
  },
  getSelectedList() {
    return clone(this.get(`${ this.getType() }Selected`));
  },
  toggleSelected(model, isSelected, selectedIndex) {
    const selectedList = this.getSelectedList();

    selectedList[model.id] = isSelected;

    this.setSelectedList(selectedList, isSelected ? selectedIndex : null);
  },
  isSelected(model) {
    const selectedList = this.getSelectedList();

    return !!selectedList[model.id];
  },
  getSelected(collection) {
    const selectedList = this.getSelectedList();

    const collectionSelected = reduce(keys(selectedList), (selected, id) => {
      if (selectedList[id] && collection.get(id)) {
        selected.push({ id });
      }

      return selected;
    }, []);

    return Radio.request('entities', `${ this.getType() }:collection`, collectionSelected);
  },
  clearSelected() {
    this.setSelectedList({}, null);

    this.trigger('select:none');
  },
  selectMultiple(selectedIds, newLastSelectedIndex = null) {
    const selectedList = this.getSelectedList();

    const newSelectedList = selectedIds.reduce((selected, id) => {
      selected[id] = true;
      return selected;
    }, selectedList);

    this.setSelectedList(newSelectedList, newLastSelectedIndex);

    this.trigger('select:multiple');
  },
};
