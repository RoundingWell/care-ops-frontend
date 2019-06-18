import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView } from 'js/views/patients/list/patients-all_views';

export default App.extend({
  beforeStart() {
    return Radio.request('entities', 'patients', 'fetch:patients:collection');
  },
  onStart(options, collection) {
    // FIXME: Temporary
    collection = new Backbone.Collection([{ name: 'foo patient' }]);

    this.showView(new ListView({ collection }));
  },
});
