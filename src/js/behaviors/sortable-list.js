import { Behavior } from 'marionette';
import Sortable from 'sortablejs';

export default Behavior.extend({
  options: {
    handle: '.js-sort',
    item: '.js-draggable',
  },
  onRender() {
    Sortable.create(this.el, {
      ...this.options,
      direction: 'vertical',
      onEnd: this.onEnd.bind(this),
      onStart: this.onStart.bind(this),
    });
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
