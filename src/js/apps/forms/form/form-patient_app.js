import Radio from 'backbone.radio';

import App from 'js/base/app';

import FormsService from 'js/services/forms';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { ContextTrailView, LayoutView, IframeView } from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: {
      AppClass: PatientSidebarApp,
      regionName: 'sidebar',
      getOptions: ['patient'],
    },
  },
  onBeforeStart() {
    this.getRegion().startPreloader();
    this.setState({
      isExpanded: false,
    });
  },
  beforeStart({ formId, patientId }) {
    return [
      Radio.request('entities', 'fetch:patients:model', patientId),
      Radio.request('entities', 'forms:model', formId),
    ];
  },
  onBeforeStop() {
    this.removeChildApp('formsService');
  },
  onStart(options, [patient], form) {
    this.patient = patient;
    this.form = form;

    this.startFormService();

    this.showView(new LayoutView());
    this.showContextTrail();
    this.showForm();
    this.showSidebar();
  },
  startFormService() {
    const formService = this.addChildApp('formsService', FormsService, {
      patient: this.patient,
      form: this.form,
    });

    this.listenTo(formService, 'success', response => {
      this.setState({ responseId: response.id });
    });
  },
  stateEvents: {
    'change:isExpanded': 'showSidebar',
    'change:responseId': 'showForm',
  },
  showContextTrail() {
    const contextTrail = new ContextTrailView({
      model: this.getState(),
      patient: this.patient,
      form: this.form,
    });

    this.listenTo(contextTrail, {
      'click:expandButton': this.onClickExpandButton,
      'click:printButton': this.onClickPrintButton,
    });

    this.showChildView('contextTrail', contextTrail);
  },
  onClickExpandButton() {
    this.toggleState('isExpanded');
  },
  onClickPrintButton() {
    Radio.request(`form${ this.form.id }`, 'send', 'print:form');
  },
  showForm() {
    this.showChildView('form', new IframeView({
      model: this.form,
      responseId: this.getState('responseId'),
    }));
  },
  showSidebar() {
    const isExpanded = this.getState('isExpanded');

    if (isExpanded) {
      this.stopChildApp('patient');
      this.getRegion('sidebar').empty();
      return;
    }

    this.startChildApp('patient');
  },
});
