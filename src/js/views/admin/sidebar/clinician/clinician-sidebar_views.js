import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/sidebar.scss';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import { GroupsComponent, RoleComponent, AccessComponent, StateComponent } from 'js/views/admin/shared/clinicians_views';
import Optionlist from 'js/components/optionlist';

import ClinicianSidebarTemplate from './clinician-sidebar.hbs';

import './clinician-sidebar.scss';

const i18n = intl.admin.sidebar.clinician.clinicianSidebarViews;

const NameView = View.extend({
  className: 'pos--relative',
  template: hbs`
    <input class="input-primary w-100 js-input{{#if error}} has-error{{/if}}" placeholder="{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.nameView.placeholder }}" value="{{ name }}" {{#unless canEdit}}disabled{{/unless}} />{{~ remove_whitespace ~}}
    {{#unless canEdit}}<span class="clinician-sidebar__locked-icon">{{far "lock"}}</span>{{/unless}}
    {{#if error}}<div class="form-error u-margin--b-4">{{ error }}</div>{{/if}}
  `,
  templateContext() {
    return {
      canEdit: this.model.isEditable(),
      error: this.getOption('error'),
    };
  },
  ui: {
    input: '.js-input',
  },
  events: {
    'input @ui.input': 'onInput',
  },
  onInput(evt) {
    this.model.set('name', evt.target.value);
  },
  onDomRefresh() {
    if (this.model.isNew()) {
      this.ui.input.focus();
    }
  },
});

const EmailView = View.extend({
  className: 'pos--relative',
  template: hbs`
    <input class="input-primary w-100 js-input{{#if error}} has-error{{/if}}" placeholder="{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.emailView.placeholder }}" value="{{ email }}" {{#unless canEdit}}disabled{{/unless}} />{{~ remove_whitespace ~}}
    {{#unless canEdit}}<span class="clinician-sidebar__locked-icon">{{far "lock"}}</span>{{/unless}}
    {{#if error}}<div class="form-error u-margin--b-4">{{ error }}</div>{{/if}}
  `,
  templateContext() {
    return {
      canEdit: this.model.isEditable(),
      error: this.getOption('error'),
    };
  },
  ui: {
    input: '.js-input',
  },
  events: {
    'input @ui.input': 'onInput',
  },
  onInput(evt) {
    this.model.set('email', evt.target.value);
  },
});

const SaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`
    <button class="button--green js-save">{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.saveView.cancelBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`<button class="button--green" disabled>{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const InfoView = View.extend({
  className: 'sidebar__info',
  template: hbs`
    {{fas "info-circle"}}{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.infoView.groupsRoleInfo }}
  `,
});

const SidebarView = View.extend({
  className: 'sidebar flex-region',
  template: ClinicianSidebarTemplate,
  templateContext() {
    return {
      showDelete: this.clinician.isEditable(),
    };
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  regions: {
    name: '[data-name-region]',
    email: '[data-email-region]',
    save: '[data-save-region]',
    role: '[data-role-region]',
    groups: '[data-groups-region]',
    info: '[data-info-region]',
    access: '[data-access-region]',
    state: '[data-state-region]',
  },
  initialize({ clinician }) {
    this.clinician = clinician;

    this.listenTo(this.clinician, {
      'change:_role': this.showInfo,
      'change:_groups': this.showInfo,
    });
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showForm();
    this.showState();
    this.showAccess();
    this.showRole();
    this.showGroups();
    this.showInfo();
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.sidebarView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.sidebarView.menuOptions.delete }}`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  cloneClinician() {
    // NOTE: creates a new clone from the truth for cancelable editing
    if (this.clonedClinician) this.stopListening(this.clonedClinician);
    this.clonedClinician = this.clinician.clone();
  },
  showName(error) {
    this.showChildView('name', new NameView({
      model: this.clonedClinician,
      error,
    }));
  },
  showEmail(error) {
    this.showChildView('email', new EmailView({
      model: this.clonedClinician,
      error,
    }));
  },
  showState() {
    this.showChildView('state', new StateComponent({ model: this.clinician }));
  },
  showAccess() {
    const isDisabled = this.clinician.isNew();
    const accessComponent = new AccessComponent({ access: this.clinician.get('access'), state: { isDisabled } });

    this.listenTo(accessComponent, 'change:access', accessType => {
      this.clinician.save({ access: accessType });
    });

    this.showChildView('access', accessComponent);
  },
  showRole() {
    const isDisabled = this.clinician.isNew();
    const roleComponent = new RoleComponent({ role: this.clinician.get('_role'), state: { isDisabled } });

    this.listenTo(roleComponent, 'change:role', role => {
      this.clinician.saveRole(role);
    });

    this.showChildView('role', roleComponent);
  },
  showGroups() {
    this.showChildView('groups', new GroupsComponent({ clinician: this.clinician }));
  },
  showSave() {
    if (!this.clonedClinician.isValid()) {
      this.showDisabledSave();
      return;
    }

    this.showChildView('save', new SaveView({ model: this.clonedClinician }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  showForm() {
    this.cloneClinician();
    this.listenTo(this.clonedClinician, 'change:name change:email', this.showSave);

    if (this.clinician.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();


    this.showName();
    this.showEmail();
  },
  showInfo() {
    if (this.clinician.isNew()) return;

    if (!this.clinician.get('_role') || this.clinician.getGroups().length === 0) {
      this.showChildView('info', new InfoView());
      return;
    }

    this.getRegion('info').empty();
  },
  showErrors({ name, email }) {
    this.showName(name);
    this.showEmail(email);
    this.showDisabledSave();
  },
  onSave() {
    if (this.clinician.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();
  },
  onCancel() {
    if (this.clinician.isNew()) {
      this.triggerMethod('close', this);
      return;
    }

    this.showForm();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.sidebarView.deleteModal.bodyText,
      headingText: i18n.sidebarView.deleteModal.headingText,
      submitText: i18n.sidebarView.deleteModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.clinician);
      },
    });
  },
});

export {
  SidebarView,
};
