import { extend } from 'underscore';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';
import store from 'store';

import App from 'js/base/app';

import FormsService from 'js/services/forms';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';
import WidgetsHeaderApp from 'js/apps/forms/widgets/widgets_header_app';

import { FormActionsView, LayoutView, IframeView, SaveView, ReadOnlyView, StatusView, StoredSubmissionView, LastUpdatedView } from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: {
      AppClass: PatientSidebarApp,
      regionName: 'sidebar',
      getOptions: ['patient'],
    },
    widgetHeader: {
      AppClass: WidgetsHeaderApp,
      regionName: 'widgets',
      getOptions: ['patient', 'form'],
    },
  },
  initFormState() {
    const storedState = store.get(`form-state_${ this.currentUser.id }`);

    this.setState(extend({ isExpanded: true, saveButtonType: 'save' }, storedState));
  },
  onBeforeStart() {
    this.getRegion().startPreloader();

    this.currentUser = Radio.request('bootstrap', 'currentUser');

    this.initFormState();
  },
  beforeStart({ formId, patientId }) {
    return [
      Radio.request('entities', 'fetch:patients:model', patientId),
      Radio.request('entities', 'fetch:forms:model', formId),
    ];
  },
  onBeforeStop() {
    this.removeChildApp('formsService');
  },
  onStart(options, patient, form) {
    this.patient = patient;
    this.form = form;
    this.isReadOnly = this.form.isReadOnly();
    this.isSubmitHidden = this.form.isSubmitHidden();

    this.startFormService();

    this.showView(new LayoutView({ model: this.form, patient }));

    this.showContent();

    this.showFormStatus();
    this.showFormSaveDisabled();
    this.showActions();

    const { updated } = Radio.request(`form${ this.form.id }`, 'get:storedSubmission');
    this.showLastUpdated(updated);

    this.startChildApp('widgetHeader');

    this.showSidebar();
  },
  startFormService() {
    const formService = this.addChildApp('formsService', FormsService, {
      patient: this.patient,
      form: this.form,
    });

    this.bindEvents(formService, this.serviceEvents);
  },
  serviceEvents: {
    'submit': 'onFormServiceSubmit',
    'success': 'onFormServiceSuccess',
    'ready': 'onFormServiceReady',
    'update:submission': 'onFormServiceUpdateSubmission',
    'error': 'onFormServiceError',
  },
  onFormServiceSubmit() {
    const saveButtonType = this.getState('saveButtonType');

    if (saveButtonType !== 'saveAndGoBack') return;

    this.loadingModal = Radio.request('modal', 'show:loading');
  },
  onFormServiceSuccess(response) {
    const saveButtonType = this.getState('saveButtonType');

    if (saveButtonType === 'saveAndGoBack') {
      this.listenTo(this.loadingModal, 'destroy', () => {
        Radio.request('history', 'go:back', () => {
          Radio.trigger('event-router', 'patient:dashboard', this.patient.id);
        });
      });

      return;
    }

    response.set({ _created_at: dayjs().format() });

    this.showForm(response.id);
    this.showFormStatus(response);

    this.getRegion('formUpdated').empty();
  },
  onFormServiceReady() {
    this.showFormSave();
  },
  onFormServiceUpdateSubmission(updated) {
    this.showLastUpdated(updated);
  },
  onFormServiceError() {
    if (this.loadingModal) this.loadingModal.destroy();

    this.showFormSave();
  },
  stateEvents: {
    'change': 'onChangeState',
    'change:saveButtonType': 'onChangeSaveButtonType',
  },
  onChangeState() {
    const isExpanded = this.getState('isExpanded');
    const saveButtonType = this.getState('saveButtonType');

    store.set(`form-state_${ this.currentUser.id }`, { isExpanded, saveButtonType });

    this.showSidebar();
  },
  showFormStatus(response) {
    if (this.isReadOnly) return;
    this.showChildView('status', new StatusView({ model: response }));
  },
  showLastUpdated(updated) {
    if (this.isReadOnly || this.getState('responseId')) return;

    const lastUpdatedView = new LastUpdatedView({ updated });

    this.showChildView('formUpdated', lastUpdatedView);
  },
  showActions() {
    const actionsView = new FormActionsView({
      model: this.getState(),
      patient: this.patient,
    });

    this.listenTo(actionsView, {
      'click:expandButton': this.onClickExpandButton,
    });

    this.showChildView('actions', actionsView);
  },
  onClickExpandButton() {
    this.toggleState('isExpanded');
  },
  showContent() {
    const { updated } = Radio.request(`form${ this.form.id }`, 'get:storedSubmission');

    if (!this.isReadOnly && updated) {
      const storedSubmissionView = this.showChildView('form', new StoredSubmissionView({ updated }));

      this.listenTo(storedSubmissionView, {
        'submit'() {
          this.showForm();
        },
        'discard:submission'() {
          Radio.request(`form${ this.form.id }`, 'clear:storedSubmission');
          this.showForm();
          this.showLastUpdated();
        },
      });

      return;
    }

    this.showForm();
  },
  showForm(responseId) {
    this.showChildView('form', new IframeView({
      model: this.form,
      responseId,
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
  showFormSaveDisabled() {
    if (this.isReadOnly) {
      this.showChildView('formAction', new ReadOnlyView());
      return;
    }

    this.showChildView('formAction', new SaveView({
      isDisabled: true,
      model: this.getState(),
    }));
  },
  showFormSave() {
    if (this.isReadOnly || this.isSubmitHidden) return;

    const saveView = this.showChildView('formAction', new SaveView({
      model: this.getState(),
    }));

    this.listenTo(saveView, {
      'click:save'() {
        Radio.request(`form${ this.form.id }`, 'send', 'form:submit');
        this.showFormSaveDisabled();
      },
      'select:button:type'(selectedSaveButtonType) {
        this.setState({ saveButtonType: selectedSaveButtonType });
      },
    });
  },
});
