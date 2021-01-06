import { isEmpty, keys } from 'underscore';
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

import AddPatientTemplate from './add-patient.hbs';

import './add-patient.scss';

const i18n = intl.globals.addPatient.addPatientViews;

const InputView = View.extend({
  template: hbs`<input class="input-primary w-100 js-input {{#if hasError}}has-error{{/if}}" value="{{ value }}" />`,
  templateContext() {
    const errors = this.getOption('state').get('backend_errors');

    return {
      hasError: errors && errors[this.getOption('errorField')],
      value: this.model.get(this.getOption('attr')),
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
  className: 'add-patient__save',
  template: hbs`
    <button class="button--green js-save" {{#if isDisabled}}disabled{{/if}}>{{ @intl.globals.addPatient.addPatientViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.globals.addPatient.addPatientViews.saveView.cancelBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'click:save',
  },
  templateContext() {
    const state = this.getOption('state');

    return {
      isDisabled: state.get('errors') || this.isDisabled,
    };
  },
  onClickSave() {
    this.isDisabled = true;
    this.render();
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
    template: hbs`{{far "user"}}{{ text }}{{#unless text}}{{ @intl.globals.addPatient.addPatientViews.sexDroplist.defaultText }}{{/unless}}`,
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
  template: hbs`{{ error }}<span class="add-patient__search js-search">{{@intl.globals.addPatient.addPatientViews.errorView.searchBtn}}</span>`,
  templateContext() {
    return {
      error: this.getOption('error'),
    };
  },
  triggers: {
    'click .js-search': 'click:search',
  },
});

const AddPatientModal = View.extend({
  className: 'modal add-patient__modal',
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
  template: AddPatientTemplate,
  initialize(options) {
    this.initState(options);
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
    const saveView = new SaveView({
      model: this.model,
      state: this.getState(),
    });

    this.showChildView('save', saveView);
  },
  showSexDroplist() {
    const sexDroplist = this.showChildView('sex', new SexDroplist({
      patient: this.model,
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

    if (!isEmpty(this.model.validationError)) {
      this.setState('errors', this.model.validationError);
      return;
    }

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

mixinState(AddPatientModal);

export {
  AddPatientModal,
};
