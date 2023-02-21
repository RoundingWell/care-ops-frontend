import Radio from 'backbone.radio';

import App from 'js/base/app';

import FormsService from 'js/services/forms';

import { PreviewView } from 'js/views/forms/form/form_views';

export default App.extend({
  beforeStart({ formId }) {
    return Radio.request('entities', 'fetch:forms:model', formId);
  },
  onBeforeStop() {
    this.removeChildApp('formsService');
  },
  onStart(options, form) {
    this.addChildApp('formsService', FormsService, { form });

    this.showView(new PreviewView({ model: form }));
  },
});
