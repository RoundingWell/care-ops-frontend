import { keys } from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';
import { mixinState } from 'marionette.toolkit';

import DateSelectComponent from 'js/components/dateselect';
import Droplist from 'js/components/droplist';
import GroupsManagerComponent from 'js/views/shared/components/groups-manager';

import InputWatcherBehavior from 'js/behaviors/input-watcher';

import intl from 'js/i18n';
import trim from 'js/utils/formatting/trim';

import PatientModalTemplate from './patient-modal.hbs';

import './patient-modal.scss';

const i18n = intl.globals.patientModal.patientModalViews;

const InputView = View.extend({
  className: 'pos--relative',
  template: hbs`
    <input class="input-primary w-100 js-input {{#if hasError}}has-error{{/if}}" value="{{ value }}" {{#unless canEdit}}disabled{{/unless}} />
    {{#unless canEdit}}<span class="patient-modal__locked-icon">{{far "lock"}}</span>{{/unless}}
  `,
  templateContext() {
    const errors = this.getOption('state').get('backend_errors');

    return {
      hasError: errors && errors[this.getOption('errorField')],
      value: this.model.get(this.getOption('attr')),
      canEdit: this.model.canEdit(),
    };
  },
  behaviors: [InputWatcherBehavior],
  ui: {
    input: '.js-input',
  },
  initialize({ state, errorField }) {
    this.listenTo(state, {
      'change:backend_errors'(currentState, errors) {
        if (errors && errors[errorField]) {
          this.render();
        } else {
          this.ui.input.removeClass('has-error');
        }
      },
    });
  },
  onWatchChange(text) {
    const newText = text;
    this.ui.input.val(newText);

    this.model.set(this.getOption('attr'), trim(newText));
  },
  onDomRefresh() {
    if (this.getOption('shouldFocus')) {
      this.ui.input.focus();
    }
  },
});

const SaveView = View.extend({
  className: 'patient-modal__save',
  template: hbs`
    <button class="button--green js-save" {{#if isDisabled}}disabled{{/if}}>{{ @intl.globals.patientModal.patientModalViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.globals.patientModal.patientModalViews.saveView.cancelBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'click:save',
  },
  modelEvents: {
    'change': 'render',
  },
  templateContext() {
    const state = this.getOption('state');
    const isDisabled = this.isSubmitting || !this.model.hasChanged() || !this.model.isValid({ preSave: true });

    return {
      isDisabled: state.get('errors') || isDisabled,
    };
  },
  onClickSave() {
    this.isSubmitting = true;
    this.render();
  },
});

const DoneView = View.extend({
  className: 'patient-modal__save',
  template: hbs`<button class="button--green js-done">{{ @intl.globals.patientModal.patientModalViews.doneView }}</button>`,
  triggers: {
    'click .js-done': 'cancel',
  },
});

const SexDroplist = Droplist.extend({
  initialize() {
    const patientSex = this.getOption('patient').get('sex');

    this.collection = new Backbone.Collection([
      {
        text: 'Male',
        value: 'm',
      },
      {
        text: 'Female',
        value: 'f',
      },
      {
        text: 'Other',
        value: 'u',
      },
    ]);

    this.setState('selected', this.collection.find({ value: patientSex }));
  },
  viewOptions: {
    className: 'button-secondary',
    template: hbs`{{far "user"}}{{ text }}{{#unless text}}{{ @intl.globals.patientModal.patientModalViews.sexDroplist.defaultText }}{{/unless}}`,
  },
});

const BirthdateView = View.extend({
  template: hbs`<div data-date-select-region></div>`,
  regions: {
    dateSelect: '[data-date-select-region]',
  },
  onRender() {
    const birthdateSelect = this.showChildView('dateSelect', new DateSelectComponent({
      state: {
        selectedDate: this.model.get('birth_date'),
        isDisabled: !this.model.canEdit(),
      },
    }));

    this.listenTo(birthdateSelect, 'change:date', (state, date) => {
      this.model.set('birth_date', date ? date.format('YYYY-MM-DD') : null);
    });

    this.listenTo(this.getOption('state'), {
      'change:errors'(currentState, errors) {
        if (!errors || errors.birth_date) {
          const hasError = errors ? errors.birth_date === 'invalidDate' : false;
          birthdateSelect.setState({ hasError });
        }
      },
    });
  },
});

const BackendErrorView = View.extend({
  template: hbs`{{ error }}<span class="patient-modal__search js-search">{{@intl.globals.patientModal.patientModalViews.errorView.searchBtn}}</span>`,
  templateContext() {
    return {
      error: this.getOption('error'),
    };
  },
  triggers: {
    'click .js-search': 'click:search',
  },
});

const PatientModal = View.extend({
  className: 'modal patient-modal',
  regions: {
    firstName: '[data-first-name-region]',
    lastName: '[data-last-name-region]',
    dob: '[data-dob-region]',
    sex: '[data-sex-region]',
    groups: '[data-groups-region]',
    save: {
      el: '[data-save-region]',
      replaceElement: true,
    },
    error: '[data-error-region]',
  },
  triggers: {
    'click .js-close': 'close',
  },
  childViewTriggers: {
    'click:save': 'click:save',
    'cancel': 'close',
    'click:search': 'click:search',
  },
  modelEvents: {
    'change': 'onChange',
    'invalid': 'onInvalid',
  },
  stateEvents: {
    'change:errors change:backend_errors': 'showError',
  },
  template: PatientModalTemplate,
  templateContext() {
    return {
      isNew: this.model.isNew(),
      canEdit: this.model.canEdit(),
    };
  },
  initialize(options) {
    this.initState(options);
    this.model = options.patient.clone();
  },
  onRender() {
    this.showFirstNameView();
    this.showLastNameView();
    this.showSexDroplist();
    this.showBirthDatePicker();
    this.showGroupsComponent();
    this.showError();
    this.showSave();
  },
  onClose() {
    this.destroy();
  },
  showFirstNameView() {
    this.showChildView('firstName', new InputView({
      model: this.model,
      state: this.getState(),
      attr: 'first_name',
      errorField: 'name',
      shouldFocus: true,
    }));
  },
  showLastNameView() {
    this.showChildView('lastName', new InputView({
      model: this.model,
      state: this.getState(),
      attr: 'last_name',
      errorField: 'name',
    }));
  },
  showSave() {
    if (!this.model.canEdit()) {
      this.showDone();
      return;
    }

    const saveView = new SaveView({
      model: this.model,
      state: this.getState(),
    });

    this.showChildView('save', saveView);
  },
  showDone() {
    this.showChildView('save', new DoneView());
  },
  showSexDroplist() {
    const sexDroplist = this.showChildView('sex', new SexDroplist({
      patient: this.model,
      state: {
        isDisabled: !this.model.canEdit(),
      },
    }));

    this.listenTo(sexDroplist, {
      'change:selected'(selected) {
        this.model.set('sex', selected.get('value'));
      },
    });
  },
  showBirthDatePicker() {
    this.showChildView('dob', new BirthdateView({
      model: this.model,
      state: this.getState(),
    }));
  },
  showGroupsComponent() {
    const groupsManager = this.showChildView('groups', new GroupsManagerComponent({
      member: this.model,
      isDisabled: !this.model.canEdit(),
    }));

    this.listenTo(groupsManager, {
      'add:member'(patient, group) {
        this.model.addGroup(group);
      },
      'remove:member'(patient, group) {
        this.model.removeGroup(group);
      },
    });
  },
  showError() {
    const errors = this.getState('errors');
    const backendError = this.getState('backend_errors');

    if (errors) {
      const field = keys(errors)[0];
      const errorCode = errors[field];

      if (errorCode === 'required') return;

      this.showChildView('error', i18n.errorView[field][errorCode]);

      return;
    }

    if (backendError) {
      const field = keys(backendError)[0];

      this.showChildView('error', new BackendErrorView({
        error: backendError[field],
      }));

      return;
    }

    this.getRegion('error').empty();
  },
  onClickSearch() {
    this.triggerMethod('search', this.model);
  },
  onClickSave() {
    this.model.isValid({ preSave: true });

    this.triggerMethod('save', this);
  },
  onChange(data) {
    this.setState({
      'errors': null,
      'backend_errors': null,
    });
    this.model.isValid();
    this.showSave();
  },
  onInvalid(model, errors) {
    this.setState({
      errors,
    });
  },
});

mixinState(PatientModal);

export {
  PatientModal,
};
