import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { STATE_STATUS } from 'js/static';

import AddWorkflowApp from './add-workflow_app';

import { LayoutView, ListView } from 'js/views/patients/patient/dashboard/dashboard_views';

export default App.extend({
  childApps: {
    addWorkflow: AddWorkflowApp,
  },

  onBeforeStart({ patient }) {
    this.patient = patient;
    this.showView(new LayoutView({ model: patient }));
    this.getRegion('content').startPreloader();
  },

  beforeStart({ patient }) {
    const filter = { status: [STATE_STATUS.QUEUED, STATE_STATUS.STARTED].join(',') };
    return [
      Radio.request('entities', 'fetch:actions:collection:byPatient', { patientId: patient.id, filter }),
      Radio.request('entities', 'fetch:flows:collection:byPatient', { patientId: patient.id, filter }),
    ];
  },

  onStart({ patient }, [actions], [flows]) {
    this.collection = new Backbone.Collection([...actions.models, ...flows.models]);

    this.showChildView('content', new ListView({ collection: this.collection }));

    const addworkflow = this.startChildApp('addWorkflow', {
      region: this.getRegion('addWorkflow'),
      patient,
    });

    this.listenTo(addworkflow, {
      'add:newAction': this.onAddNewAction,
      'add:programAction': this.onAddProgramAction,
      'add:programFlow': this.onAddProgramFlow,
    });
  },

  onAddNewAction() {
    Radio.trigger('event-router', 'patient:action:new', this.patient.id);
  },

  onAddProgramAction(programAction) {
    const action = programAction.getAction({ patientId: this.patient.id });
    action.saveAll().done(() => {
      this.collection.unshift(action);

      Radio.trigger('event-router', 'patient:action', this.patient.id, action.id);
    });
  },

  onAddProgramFlow(programFlow) {
    const flow = programFlow.getFlow(this.patient.id);

    flow.saveAll().done(() => {
      Radio.trigger('event-router', 'flow', flow.id);
    });

    return;
  },

  onEditAction(action) {
    if (action.isNew()) {
      this.collection.unshift(action);
      return;
    }
    action.trigger('editing', true);
  },
});
