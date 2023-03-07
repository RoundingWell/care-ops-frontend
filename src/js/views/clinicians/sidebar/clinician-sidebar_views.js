import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/forms.scss';
import 'scss/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import { WorkspacesComponent, TeamComponent, RoleComponent, StateComponent } from 'js/views/clinicians/shared/clinicians_views';

import ClinicianSidebarTemplate from './clinician-sidebar.hbs';

import './clinician-sidebar.scss';

const NameView = View.extend({
  className: 'pos--relative',
  template: hbs`
    <input class="input-primary w-100 js-input{{#if error}} has-error{{/if}}" placeholder="{{ @intl.clinicians.sidebar.clinicianSidebarViews.nameView.placeholder }}" value="{{ name }}" {{#unless canEdit}}disabled{{/unless}} />{{~ remove_whitespace ~}}
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
});

const EmailView = View.extend({
  className: 'pos--relative',
  template: hbs`
    <input class="input-primary w-100 js-input{{#if error}} has-error{{/if}}" placeholder="{{ @intl.clinicians.sidebar.clinicianSidebarViews.emailView.placeholder }}" value="{{ email }}" {{#unless canEdit}}disabled{{/unless}} />{{~ remove_whitespace ~}}
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
    <button class="button--green js-save">{{ @intl.clinicians.sidebar.clinicianSidebarViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.clinicians.sidebar.clinicianSidebarViews.saveView.cancelBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`<button class="button--green" disabled>{{ @intl.clinicians.sidebar.clinicianSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const InfoView = View.extend({
  className: 'sidebar__info',
  template: hbs`
    {{fas "circle-info"}}{{ @intl.clinicians.sidebar.clinicianSidebarViews.infoView.workspaceTeamInfo }}
  `,
});

const SidebarView = View.extend({
  className: 'sidebar flex-region',
  template: ClinicianSidebarTemplate,
  triggers: {
    'click .js-close': 'close',
  },
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  regions: {
    name: '[data-name-region]',
    email: '[data-email-region]',
    save: '[data-save-region]',
    team: '[data-team-region]',
    workspaces: '[data-workspaces-region]',
    info: '[data-info-region]',
    role: '[data-role-region]',
    state: '[data-state-region]',
  },
  initialize({ clinician }) {
    this.clinician = clinician;

    this.listenTo(this.clinician, {
      'change:enabled': this.onChangeEnabled,
      'change:_team': this.showInfo,
      'change:_workspaces': this.showInfo,
    });
  },
  onAttach() {
    animSidebar(this.el);
  },
  onChangeEnabled() {
    this.showState();
    this.showRole();
    this.showTeam();
    this.showWorkspaces();
  },
  onRender() {
    this.showForm();
    this.showState();
    this.showRole();
    this.showTeam();
    this.showWorkspaces();
    this.showInfo();
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
    const isActive = this.clinician.isActive();
    const selectedId = this.clinician.get('enabled') ? 'enabled' : 'disabled';

    const stateComponent = new StateComponent({ isActive, selectedId });

    this.listenTo(stateComponent, 'change:selected', selected => {
      this.clinician.save({ enabled: selected.id !== 'disabled' });
    });

    this.showChildView('state', stateComponent);
  },
  showRole() {
    const isDisabled = !this.clinician.get('enabled');
    const roleComponent = new RoleComponent({ role: this.clinician.getRole(), state: { isDisabled } });

    this.listenTo(roleComponent, 'change:role', role => {
      this.clinician.saveRole(role);
    });

    this.showChildView('role', roleComponent);
  },
  showTeam() {
    const isDisabled = !this.clinician.get('enabled');
    const teamComponent = new TeamComponent({ team: this.clinician.get('_team'), state: { isDisabled } });

    this.listenTo(teamComponent, 'change:team', team => {
      this.clinician.saveTeam(team);
    });

    this.showChildView('team', teamComponent);
  },
  showWorkspaces() {
    const workspacesManager = this.showChildView('workspaces', new WorkspacesComponent({
      member: this.clinician,
      workspaces: Radio.request('bootstrap', 'workspaces'),
      droplistOptions: {
        isDisabled: !this.clinician.get('enabled'),
      },
    }));

    this.listenTo(workspacesManager, {
      'add:member'(clinician, workspace) {
        workspace.addClinician(clinician);
      },
      'remove:member'(clinician, workspace) {
        workspace.removeClinician(clinician);
      },
    });
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

    this.getRegion('save').empty();

    this.showName();
    this.showEmail();
  },
  showInfo() {
    if (!this.clinician.hasTeam() || this.clinician.getWorkspaces().length === 0) {
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
    this.getRegion('save').empty();
  },
  onCancel() {
    this.showForm();
  },
});

export {
  SidebarView,
};
