import { get, map } from 'underscore';
import Radio from 'backbone.radio';

import collectionOf from 'js/utils/formatting/collection-of';
import App from 'js/base/app';

import { FormWidgetsHeaderView } from 'js/views/forms/form/widgets/widget_header_view';

export default App.extend({
  beforeStart({ patient, form }) {
    const formWidgets = form.getWidgets();
    const widgets = Radio.request('entities', 'widgets:collection', collectionOf(get(formWidgets, 'widgets'), 'id'));
    const requests = map(get(formWidgets, 'fields'), fieldName => patient.fetchField(fieldName));
    requests.unshift(widgets);
    return requests;
  },
  onStart({ patient }, widgets) {
    if (!widgets.length) return;

    this.showView(new FormWidgetsHeaderView({
      model: patient,
      collection: widgets,
    }));
  },
});
