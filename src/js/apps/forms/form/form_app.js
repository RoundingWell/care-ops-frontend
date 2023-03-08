import { extend } from 'underscore';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';
import store from 'store';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';
import WidgetsHeaderApp from 'js/apps/forms/widgets/widgets_header_app';

import FormsService from 'js/services/forms';

import {
  LayoutView,
  IframeView,
  StoredSubmissionView,
  FormStateActionsView,
  StatusView,
  ReadOnlyView,
  SaveView,
  UpdateView,
  HistoryView,
  LastUpdatedView,
} from 'js/views/forms/form/form_views';

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

    this.setState(extend({
      isActionSidebar: true,
      isExpanded: true,
      shouldShowHistory: false,
      saveButtonType: 'save',
    }, storedState));
  },
  onBeforeStart() {
    this.getRegion().startPreloader();

    this.currentUser = Radio.request('bootstrap', 'currentUser');

    this.initFormState();
  },
  beforeStart({ patientActionId }) {
    return [
      Radio.request('entities', 'fetch:forms:byAction', patientActionId),
      Radio.request('entities', 'fetch:actions:model', patientActionId),
      Radio.request('entities', 'fetch:patients:model:byAction', patientActionId),
    ];
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.forms.form.formApp.notFound);
    Radio.trigger('event-router', 'default');
  },
  onBeforeStop() {
    this.removeChildApp('formsService');
  },
  onStart(options, form, action, patient) {
    this.form = form;
    this.patient = patient;
    this.action = action;
    this.responses = action.getFormResponses();
    this.isReadOnly = this.form.isReadOnly();
    this.isSubmitHidden = this.form.isSubmitHidden();

    this.listenTo(action, 'destroy', function() {
      Radio.request('alert', 'show:success', intl.forms.form.formApp.deleteSuccess);
      Radio.trigger('event-router', 'default');
    });

    this.startFormService();

    this.setView(new LayoutView({ model: this.form, patient, action }));

    this.setState({ responseId: !!this.responses.length && this.responses.first().id });
    this.startChildApp('widgetHeader');

    this.showStateActions();
    this.showFormActions();

    this.showSidebar();

    this.showView();
  },
  startFormService() {
    const formService = this.addChildApp('formsService', FormsService, {
      patient: this.patient,
      action: this.action,
      form: this.form,
      responses: this.responses,
    });

    if (!this.isReadOnly) this.bindEvents(formService, this.serviceEvents);
  },
  serviceEvents: {
    'submit': 'onFormServiceSubmit',
    'success': 'onFormServiceSuccess',
    'error': 'onFormServiceError',
    'ready': 'onFormServiceReady',
    'update:submission': 'onFormServiceUpdateSubmission',
  },
  shouldSaveAndGoBack() {
    const saveButtonType = this.getState('saveButtonType');

    return (saveButtonType === 'saveAndGoBack' && !this.isSubmitHidden);
  },
  onFormServiceSubmit() {
    if (!this.shouldSaveAndGoBack()) return;

    this.loadingModal = Radio.request('modal', 'show:loading');
  },
  onFormServiceSuccess(response) {
    if (this.shouldSaveAndGoBack()) {
      this.listenTo(this.loadingModal, 'destroy', () => {
        Radio.request('history', 'go:back', () => {
          Radio.trigger('event-router', 'patient:dashboard', this.patient.id);
        });
      });

      return;
    }

    response.set({ _created_at: dayjs().format() });
    this.responses.unshift(response);
    this.setState({ responseId: response.id });
  },
  onFormServiceError() {
    if (this.loadingModal) this.loadingModal.destroy();

    this.showFormSave();
  },
  onFormServiceReady() {
    this.showFormSave();
  },
  onFormServiceUpdateSubmission(updated) {
    this.showLastUpdated(updated);
  },
  stateEvents: {
    'change': 'onChangeState',
    'change:isExpanded': 'showSidebar',
    'change:isActionSidebar': 'showSidebar',
    'change:shouldShowHistory': 'showFormActions',
    'change:responseId': 'onChangeResponseId',
  },
  onChangeState(state) {
    store.set(`form-state_${ this.currentUser.id }`, state.pick('isExpanded', 'saveButtonType'));
  },
  onChangeResponseId() {
    this.showFormActions();
    this.showContent();
  },
  showStateActions() {
    const formStateActions = new FormStateActionsView({
      model: this.getState(),
      action: this.action,
      responses: this.responses,
    });

    this.listenTo(formStateActions, {
      'click:sidebarButton': this.onClickSidebarButton,
      'click:expandButton': this.onClickExpandButton,
      'click:historyButton': this.onClickHistoryButton,
    });

    this.showChildView('stateActions', formStateActions);
  },
  onClickSidebarButton() {
    if (this.getState('isExpanded')) {
      this.setState({ isActionSidebar: true, isExpanded: false });
      return;
    }

    this.toggleState('isActionSidebar');
  },
  onClickExpandButton() {
    this.toggleState('isExpanded');
  },
  onClickHistoryButton() {
    this.setState({ responseId: this.responses.first().id, shouldShowHistory: !this.getState('shouldShowHistory') });
  },
  showContent() {
    const responseId = this.getState('responseId');
    const { updated } = Radio.request(`form${ this.form.id }`, 'get:storedSubmission');

    if (!this.isReadOnly && !responseId && updated) {
      const storedSubmissionView = this.showChildView('form', new StoredSubmissionView({ updated }));

      this.listenTo(storedSubmissionView, {
        'submit'() {
          this.showForm();
        },
        'discard:submission'() {
          Radio.request(`form${ this.form.id }`, 'clear:storedSubmission');
          this.showForm();
          this.showFormActions();
        },
      });

      return;
    }

    this.showForm();
  },
  showForm() {
    this.showChildView('form', new IframeView({
      model: this.form,
      responseId: this.getState('responseId'),
    }));
  },
  showSidebar() {
    const isActionSidebar = this.getState('isActionSidebar');
    const isExpanded = this.getState('isExpanded');

    if (!isActionSidebar || isExpanded) {
      Radio.request('sidebar', 'close');
    }

    if (isExpanded) {
      this.stopChildApp('patient');
      this.getRegion('sidebar').empty();
      return;
    }

    if (isActionSidebar) {
      this.showActionSidebar();
    }

    this.startChildApp('patient');
  },
  showActionSidebar() {
    const sidebarApp = Radio.request('sidebar', 'start', 'action', { action: this.action, isShowingForm: true });

    this.listenTo(sidebarApp, 'stop', () => {
      if (this.getState('isExpanded')) return;
      this.setState('isActionSidebar', false);
    });
  },
  showFormActions() {
    if (this.isReadOnly) {
      this.showReadOnly();
      return;
    }

    this.getRegion('formUpdated').empty();

    // If there's a submission this always shows
    this.showFormStatus();

    if (this.getState('shouldShowHistory')) {
      this.showFormHistory();
      return;
    }

    if (this.getState('responseId')) {
      this.showFormUpdate();
      return;
    }

    const { updated } = Radio.request(`form${ this.form.id }`, 'get:storedSubmission');
    this.showLastUpdated(updated);

    this.showFormSaveDisabled();
  },
  showReadOnly() {
    this.showChildView('formAction', new ReadOnlyView());
  },
  showFormStatus() {
    if (!this.responses.first()) return;

    this.showChildView('status', new StatusView({
      model: this.responses.first(),
    }));
  },
  showFormHistory() {
    const selected = this.responses.get(this.getState('responseId'));

    const historyView = this.showChildView('formAction', new HistoryView({ selected, collection: this.responses }));

    this.listenTo(historyView, {
      'change:response'(response) {
        this.setState({ responseId: response.id });
      },
      'click:current'() {
        this.setState({ responseId: this.responses.first().id, shouldShowHistory: false });
      },
    });
  },
  showFormUpdate() {
    const updateView = this.showChildView('formAction', new UpdateView());

    this.listenTo(updateView, 'click', () => {
      this.setState({ responseId: null });
    });
  },
  showLastUpdated(updated) {
    const lastUpdatedView = new LastUpdatedView({ updated });

    this.showChildView('formUpdated', lastUpdatedView);
  },
  showFormSaveDisabled() {
    if (this.isSubmitHidden) {
      this.getRegion('formAction').empty();
      return;
    }

    this.showChildView('formAction', new SaveView({
      isDisabled: true,
      model: this.getState(),
    }));
  },
  showFormSave() {
    if (this.isSubmitHidden) return;

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
