import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, HistoryBarView, FormView } from 'js/views/forms/form/form-history_views';

export default App.extend({
  viewEvents: {
    'select:response': 'onSelectResponse',
  },
  stateEvents: {
    'change:response': 'showIframeView',
  },
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('iframe').startPreloader();
  },
  beforeStart({ action }) {
    return action.fetch();
  },
  onStart({ form }, action) {
    this.form = form;
    const formResponses = action.getFormResponses();

    const historyBarView = this.showChildView('history', new HistoryBarView({
      formResponses,
      state: {
        selected: formResponses.first(),
      },
    }));

    this.listenTo(historyBarView, 'click:current', this.onClickCurrent);

    this.setState('response', formResponses.first());

    const iframeView = this.getChildView('iframe');
    Radio.reply(`form${ this.form.id }`, 'print:form', () => {
      iframeView.print();
    });
  },
  onStop() {
    Radio.stopReplying(`form${ this.form.id }`);
  },
  onClickCurrent() {
    this.stop();
  },
  onSelectResponse(response) {
    this.setState('response', response);
  },
  showIframeView() {
    this.showChildView('iframe', new FormView({
      form: this.form,
      model: this.getState('response'),
    }));
  },
});
