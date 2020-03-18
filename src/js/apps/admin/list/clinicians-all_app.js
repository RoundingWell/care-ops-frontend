import Radio from 'backbone.radio';

import App from 'js/base/app';
import { ListView, LayoutView } from 'js/views/admin/list/clinicians-all_views';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('list').startPreloader();
  },
  beforeStart() {
    return Radio.request('entities', 'fetch:clinicians:collection');
  },
  onStart(options, collection) {
    this.clinicians = collection;
    this.showChildView('list', new ListView({ collection }));
  },
});
