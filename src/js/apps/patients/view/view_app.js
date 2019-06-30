import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView, LayoutView } from 'js/views/patients/view/view_views';

export default App.extend({
  onBeforeStart({ viewId }) {
    this.showView(new LayoutView({ viewId }));
  },
  beforeStart({ viewId }) {
    return Radio.request('entities', 'fetch:actions:collection');
  },
  onStart(options, collection) {
    this.showChildView('list', new ListView({ collection }));
  },
});
