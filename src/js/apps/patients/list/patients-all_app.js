import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView, LayoutView } from 'js/views/patients/list/patients-all_views';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
  },
  beforeStart() {
    return Radio.request('entities', 'fetch:patients:collection');
  },
  onStart(options, collection) {
    this.showChildView('list', new ListView({ collection }));
  },
});
