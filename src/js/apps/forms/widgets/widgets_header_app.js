import { map } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { FormWidgetsHeaderView } from 'js/views/forms/form/widgets/widget_header_view';

export default App.extend({
  beforeStart({ patient, form }) {
    return map(form.getWidgetFields(), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });
  },
  onStart({ patient, form }) {
    const widgets = form.getWidgets();

    if (!widgets.length) return;

    this.showView(new FormWidgetsHeaderView({
      model: patient,
      collection: widgets,
    }));
  },
});
