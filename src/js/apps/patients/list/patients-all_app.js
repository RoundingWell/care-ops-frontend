import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView } from 'js/views/patients/list/patients-all_views';

export default App.extend({
  beforeStart() {
    return Radio.request('entities', 'fetch:patients:collection');
  },
  onStart(options, collection) {
    this.showView(new ListView({ collection }));
  },
});
