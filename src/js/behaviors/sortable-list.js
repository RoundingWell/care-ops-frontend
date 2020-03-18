import { Behavior } from 'marionette';
import Sortable from 'sortablejs';

export default Behavior.extend({
  options: {
    handle: '.js-sort',
    item: '.js-draggable',
  },
  initialize() {
    this.shouldDisable = this.getOption('shouldDisable');
  },
  /* istanbul ignore next: sensible but unused default */
  shouldDisable() {
    return this.view.collection.length < 2;
  },
  collectionEvents: {
    'update change:id': 'updateDisabled',
  },
  updateDisabled() {
    const shouldDisabled = this.shouldDisable();
    this.view.$el.toggleClass('is-draggable', !shouldDisabled);
    this.sortable.option('disabled', shouldDisabled);
  },
  onRender() {
    if (this.sortable) this.sortable.destroy();

    this.sortable = Sortable.create(this.el, {
      handle: this.getOption('handle'),
      item: this.getOption('item'),
      direction: 'vertical',
      onEnd: this.onEnd.bind(this),
      onStart: this.onStart.bind(this),
    });

    this.updateDisabled();
  },
  onBeforeDestroy() {
    this.sortable.destroy();
  },
  onEnd({ oldIndex, newIndex }) {
    const movedModel = this.view.collection.models[oldIndex];
    this.view.$el.removeClass('is-dragging');

    this.view.collection.models.splice(oldIndex, 1);
    this.view.collection.models.splice(newIndex, 0, movedModel);

    this.view.triggerMethod('drag:end', movedModel);
  },
  onStart({ oldIndex }) {
    const movedModel = this.view.collection.models[oldIndex];

    this.view.$el.addClass('is-dragging');
    this.view.triggerMethod('drag:start', movedModel);
  },
});
