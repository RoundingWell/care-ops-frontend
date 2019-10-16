import Radio from 'backbone.radio';

import App from 'js/base/app';
import { ListView, LayoutView } from 'js/views/programs/list/programs-all_views';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('list').startPreloader();
  },
  beforeStart() {
    return Radio.request('entities', 'fetch:programs:collection');
  },
  onStart(options, collection) {
    this.showChildView('list', new ListView({ collection }));
  },
});
