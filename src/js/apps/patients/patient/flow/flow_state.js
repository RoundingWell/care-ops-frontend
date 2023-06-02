import { clone, keys, reduce } from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  defaults() {
    return {
      actionBeingEdited: null,
      lastSelectedIndex: null,
      actionsSelected: {},
    };
  },
  isBeingEdited(model) {
    return this.get('actionBeingEdited') === model.id;
  },
  setSelectedList(list, lastSelectedIndex) {
    return this.set({
      actionsSelected: list,
      lastSelectedIndex,
    });
  },
  getSelectedList() {
    return clone(this.get('actionsSelected'));
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

    return Radio.request('entities', 'actions:collection', collectionSelected);
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
});
