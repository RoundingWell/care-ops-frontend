import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  channelName: 'history',

  radioRequests: {
    'set:latestList': 'setLatestList',
    'has:latestList': 'hasLatestList',
    'go:latestList': 'goLatestList',
  },

  setLatestList(event, eventArgs = []) {
    this._latestList = event;
    this._latestListArgs = eventArgs;
  },

  hasLatestList() {
    return !!this._latestList;
  },

  goLatestList() {
    if (!this.hasLatestList()) return;
    Radio.trigger('event-router', this._latestList, ...this._latestListArgs);
  },
});
