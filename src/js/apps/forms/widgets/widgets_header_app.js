import { map } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { FormWidgetsHeaderView } from 'js/views/forms/form/widgets/widget_header_view';

export default App.extend({
  beforeStart({ patient, form }) {
    const workspacePatient = Radio.request('entities', 'fetch:workspacePatients:byPatient', patient.id);
    const fields = map(form.getWidgetFields(), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });

    return [workspacePatient, ...fields];
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
