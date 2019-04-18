import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  channelName: 'nav',
  radioRequests: {
    'select': 'select',
  },
  collection: Radio.request('entities', 'navSection:collection'),
});
