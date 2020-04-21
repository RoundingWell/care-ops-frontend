import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/sidebar.scss';

import { GroupsComponent, RoleComponent, AccessComponent } from 'js/views/admin/shared/clinicians_components';

import ClinicianSidebarTemplate from './clinician-sidebar.hbs';

import './clinician-sidebar.scss';

const NameView = View.extend({
  className: 'pos--relative',
  template: hbs`<input class="input-primary w-100 js-input" placeholder="{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.nameView.placeholder }}" value="{{ name }}" />`,
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
  template: hbs`<input class="input-primary w-100 js-input" placeholder="{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.emailView.placeholder }}" value="{{ email }}" />`,
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
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.saveView.cancelBtn }}</button>
    <button class="button--green js-save">{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.saveView.saveBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`<button class="button--green" disabled>{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const InfoView = View.extend({
  className: 'sidebar__info',
  template: hbs`
    {{fas "info-circle"}}{{ @intl.admin.sidebar.clinician.clinicianSidebarViews.infoView.groupsRoleInfo }}
  `,
});

const SidebarView = View.extend({
  modelEvents: {
    'change:_groups change:_role': 'showInfo',
  },
  className: 'sidebar flex-region',
  template: ClinicianSidebarTemplate,
  triggers: {
    'click .js-close': 'close',
    // 'click .js-menu': 'click:menu',
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
  },
  onRender() {
    this.showForm();
    this.showAccess();
    this.showRole();
    this.showGroups();
    this.showInfo();
  },
  showName() {
    this.showChildView('name', new NameView({ model: this.model }));
  },
  showEmail() {
    this.showChildView('email', new EmailView({ model: this.model }));
  },
  showAccess() {
    const isDisabled = this.model.isNew();
    const accessComponent = new AccessComponent({ model: this.model, state: { isDisabled } });

    this.listenTo(accessComponent, 'change:access', accessType => {
      this.model.save({ access: accessType });
    });

    this.showChildView('access', accessComponent);
  },
  showRole() {
    const isDisabled = this.model.isNew();
    const roleComponent = new RoleComponent({ model: this.model, state: { isDisabled } });

    this.listenTo(roleComponent, 'change:role', role => {
      this.model.saveRole(role);
    });

    this.showChildView('role', roleComponent);
  },
  showGroups() {
    this.showChildView('groups', new GroupsComponent({
      clinician: this.model,
    }));
  },
  showSave() {
    if (!this.model.isValid()) {
      this.showDisabledSave();
      return;
    }

    this.showChildView('save', new SaveView({ model: this.model }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  showForm() {
    if (this.model.isNew()) {
      this.listenTo(this.model, 'change:name change:email', this.showSave);
      this.showDisabledSave();
    }

    this.showName();
    this.showEmail();
  },
  showInfo() {
    if (this.model.isNew()) return;

    if (!this.model.get('_role') || this.model.getGroups().length === 0) {
      this.showChildView('info', new InfoView());
      return;
    }

    this.getRegion('info').empty();
  },
  onSave() {
    this.getRegion('save').empty();
  },
  onCancel() {
    this.triggerMethod('close', this);
  },
});

export {
  SidebarView,
};
