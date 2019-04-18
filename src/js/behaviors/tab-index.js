import Radio from 'backbone.radio';
import { Behavior } from 'marionette';

export default Behavior.extend({
  // FIXME Add support for multiple items per view
  options: {
    channelName: 'tab-index',
    tabGroupName: 'defaultTabGroup',
    // Context of `onTab` is this.view
    onTab() {
      this.$el.focus();
    },
  },

  onInitialize(options) {
    this.getErrors();

    this.setTabDataOnView();

    Radio.request(this.getOption('channelName'), 'register:element', this.view);
  },

  getErrors() {
    if (!this.getOption('tabIndex')) {
      throw new Error('TabIndex argument is missing');
    }
  },

  setTabDataOnView() {
    this.view.__tabGroupName = this.getOption('tabGroupName');
    this.view.__tabIndex = this.getOption('tabIndex');
  },

  onTab() {
    this.getOption('onTab').apply(this.view, arguments);
  },
});
