import Radio from 'backbone.radio';

import App from 'js/base/app';

import { Layout } from 'js/views/forms/form/form-update_views';

export default App.extend({
  viewEvents: {
    'click:update': 'onClickUpdate',
  },
  stateEvents: {
    'change:shouldUpdate': 'showLayout',
  },
  onStart({ form, response, action }) {
    this.form = form;
    this.response = response;
    this.action = action;

    this.setState('shouldUpdate', false);
    this.showLayout();

    const layoutView = this.getView();
    Radio.reply(`form${ this.form.id }`, 'print:form', () => {
      layoutView.print();
    });
  },
  onStop() {
    Radio.stopReplying(`form${ this.form.id }`);
  },
  onClickUpdate() {
    this.setState({
      shouldUpdate: true,
    });
  },
  showLayout() {
    this.showView(new Layout({
      model: this.form,
      response: this.response,
      state: this.getState(),
      action: this.action,
    }));
  },
});
