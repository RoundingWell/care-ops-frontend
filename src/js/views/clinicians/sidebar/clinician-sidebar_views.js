import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/sidebar.scss';

import { animSidebar } from 'js/anim';

import { GroupsComponent, TeamComponent, AccessComponent, StateComponent } from 'js/views/clinicians/shared/clinicians_views';

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
  onDomRefresh() {
    if (this.model.isNew()) {
      this.ui.input.focus();
    }
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
    {{fas "info-circle"}}{{ @intl.clinicians.sidebar.clinicianSidebarViews.infoView.groupTeamInfo }}
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
    groups: '[data-groups-region]',
    info: '[data-info-region]',
    access: '[data-access-region]',
    state: '[data-state-region]',
  },
  initialize({ clinician }) {
    this.clinician = clinician;

    this.listenTo(this.clinician, {
      'change:enabled': this.onChangeEnabled,
      'change:_team': this.showInfo,
      'change:_groups': this.showInfo,
    });
  },
  onAttach() {
    animSidebar(this.el);
  },
  onChangeEnabled() {
    this.showState();
    this.showAccess();
    this.showTeam();
    this.showGroups();
  },
  onRender() {
    this.showForm();
    this.showState();
    this.showAccess();
    this.showTeam();
    this.showGroups();
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
    const isDisabled = this.clinician.isNew();
    const isActive = this.clinician.isActive();
    const selectedId = this.clinician.get('enabled') ? 'enabled' : 'disabled';

    const stateComponent = new StateComponent({ isActive, selectedId, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:selected', selected => {
      this.clinician.save({ enabled: selected.id !== 'disabled' });
    });

    this.showChildView('state', stateComponent);
  },
  showAccess() {
    const isDisabled = this.clinician.isNew() || !this.clinician.get('enabled');
    const accessComponent = new AccessComponent({ access: this.clinician.get('access'), state: { isDisabled } });

    this.listenTo(accessComponent, 'change:access', accessType => {
      this.clinician.save({ access: accessType });
    });

    this.showChildView('access', accessComponent);
  },
  showTeam() {
    const isDisabled = this.clinician.isNew() || !this.clinician.get('enabled');
    const teamComponent = new TeamComponent({ team: this.clinician.get('_team'), state: { isDisabled } });

    this.listenTo(teamComponent, 'change:team', team => {
      this.clinician.saveTeam(team);
    });

    this.showChildView('team', teamComponent);
  },
  showGroups() {
    const groupsManager = this.showChildView('groups', new GroupsComponent({
      member: this.clinician,
      droplistOptions: {
        isDisabled: this.clinician.isNew() || !this.clinician.get('enabled'),
      },
    }));

    this.listenTo(groupsManager, {
      'add:member'(clinician, group) {
        group.addClinician(this.clinician);
      },
      'remove:member'(clinician, group) {
        group.removeClinician(this.clinician);
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

    if (this.clinician.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();


    this.showName();
    this.showEmail();
  },
  showInfo() {
    if (this.clinician.isNew()) return;

    if (!this.clinician.get('_team') || this.clinician.getGroups().length === 0) {
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
});

export {
  SidebarView,
};
