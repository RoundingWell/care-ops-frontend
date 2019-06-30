import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView } from 'js/views/patients/view/view_views';

export default App.extend({
  beforeStart({ viewId }) {
    return Radio.request('entities', 'fetch:actions:collection');
  },
  onStart(options, collection) {
    this.showView(new ListView({ collection }));
  },
});
