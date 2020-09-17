import Radio from 'backbone.radio';

import App from 'js/base/app';

import { PreviewView } from 'js/views/forms/form/form_views';

export default App.extend({
  beforeStart({ formId }) {
    return Radio.request('entities', 'forms:model', formId);
  },
  onStart(options, form) {
    this.showView(new PreviewView({ model: form }));
  },
});
