import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, ListView } from 'js/views/patients/patient/data-events/data-events_views';

export default App.extend({
  onBeforeStart({ patient }) {
    this.showView(new LayoutView({ model: patient }));
    this.getRegion('content').startPreloader();
  },
  beforeStart({ patient }) {
    const filter = { status: 'done' };

    return [
      Radio.request('entities', 'fetch:actions:collection:byPatient', { patientId: patient.id, filter }),
      Radio.request('entities', 'fetch:flows:collection:byPatient', { patientId: patient.id, filter }),
      Radio.request('entities', 'fetch:patientEvents:collection', {
        patientId: patient.id,
        filter: {
          type: 'PatientCheckInCompleted',
        },
      }),
    ];
  },
  onStart({ patient }, [actions], [flows], [events]) {
    this.collection = new Backbone.Collection([...actions.models, ...flows.models, ...events.models]);
    this.showChildView('content', new ListView({ collection: this.collection }));
  },
  onEditAction(action) {
    action.trigger('editing', true);
  },
});
