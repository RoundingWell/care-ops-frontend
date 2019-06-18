import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView } from 'js/views/patients/view/view_views';

export default App.extend({
  beforeStart({ viewId }) {
    return Radio.request('entities', 'actions', 'fetch:actions:collection');
  },
  onStart(options, collection) {
    // FIXME: Temporary
    collection = new Backbone.Collection([{ name: 'foo action' }]);

    this.showView(new ListView({ collection }));
  },
});
