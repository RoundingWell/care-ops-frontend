import Radio from 'backbone.radio';

import BaseModel from 'js/base/model';

import App from 'js/base/app';

import { LayoutView } from 'js/views/forms/form/form_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

const TempData = BaseModel.extend({
  url: '/api/temp-test-form',
  getPatient() {
    return Radio.request('entities', 'patients:model', this.get('_patient'));
  },
  getAction() {
    return Radio.request('entities', 'actions:model', this.get('_action'));
  },
});

export default App.extend({
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  beforeStart({ formId, patientActionId }) {
    const model = new TempData();
    return model.fetch();
  },
  onStart(options, tempForm) {
    this.tempForm = tempForm;
    this.showView(new LayoutView({
      model: tempForm,
      state: this.getState(),
    }));
    this.showActionSidebar();
  },
  viewEvents: {
    'click:sidebarButton': 'onClickSidebarButton',
  },
  onClickSidebarButton() {
    const actionSidebar = this.getState('actionSidebar');

    if (!actionSidebar) {
      this.showActionSidebar();
      return;
    }

    actionSidebar.stop();
  },
  showPatientSidebar() {
    this.setState('actionSidebar', false);
    this.showChildView('sidebar', new SidebarView({ model: this.tempForm.getPatient() }));
  },
  showActionSidebar() {
    this.getRegion('sidebar').empty();

    const sidebar = Radio.request('sidebar', 'start', 'action', { action: this.tempForm.getAction() });

    this.listenTo(sidebar, 'stop', this.showPatientSidebar);

    this.setState('actionSidebar', sidebar);
  },
});
