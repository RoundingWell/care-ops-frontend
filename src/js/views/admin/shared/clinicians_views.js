import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { CollectionView, View } from 'marionette';

import Droplist from 'js/components/droplist';
import AccessComponent from './components/access_component';
import RoleComponent from './components/role_component';

import intl, { renderTemplate } from 'js/i18n';

import './clinician-groups.scss';
import './clinician-state.scss';

const i18n = intl.admin.shared.cliniciansComponents;

const GroupsItemView = View.extend({
  tagName: 'li',
  className: 'clinician-groups__item',
  template: hbs`<span class="clinician-groups__item-icon">{{far "users"}}</span>{{name}}<button class="button--icon clinician-groups__remove js-remove">{{far "trash-alt"}}</button>`,
  triggers: {
    'click .js-remove': 'remove',
  },
});

const ClinicianGroupsView = CollectionView.extend({
  tagName: 'ul',
  childView: GroupsItemView,
  childViewTriggers: {
    'remove': 'remove',
  },
  onRemove(child) {
    this.triggerMethod('remove:clinician', child.model);
  },
});

const GroupsDropList = Droplist.extend({
  initialize() {
    this.listenTo(this.collection, 'update', this.show);
  },
  viewOptions: {
    className: 'button-secondary clinician-groups__droplist',
    template: hbs`{{far "users"}}{{ @intl.admin.shared.cliniciansComponents.groupsDroplist.addGroup }}`,
  },
  picklistOptions: {
    attr: 'name',
  },
  onShow() {
    if (this.getOption('clinician').isNew()) {
      this.setState({ isDisabled: true });
      return;
    }

    this.setState({ isDisabled: this.collection.length === 0 });
  },
  onPicklistSelect({ model }) {
    this.triggerMethod('add:clinician', model);
    this.popRegion.empty();
  },
});

const GroupsComponent = View.extend({
  template: hbs`
    <div data-groups-region></div>
    <div data-droplist-region></div>
  `,
  regions: {
    groups: '[data-groups-region]',
    droplist: '[data-droplist-region]',
  },
  initialize({ clinician }) {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.clinician = clinician;
    this.clinicianGroups = this.clinician.getGroups();
    this.groups = this.currentClinician.getGroups();

    this.groups.remove(this.clinicianGroups.models);

    this.listenTo(this.clinicianGroups, {
      'add': this.onAddClinicianGroup,
      'remove': this.onRemoveClinicianGroup,
    });
  },
  onRender() {
    this.showGroups();
    this.showDroplist();
  },
  showGroups() {
    const groupsView = this.showChildView('groups', new ClinicianGroupsView({
      collection: this.clinicianGroups,
    }));

    this.listenTo(groupsView, 'remove:clinician', this.removeClinicianGroup);
  },
  showDroplist() {
    const droplist = this.showChildView('droplist', new GroupsDropList({
      collection: this.groups,
      clinician: this.clinician,
    }));

    this.listenTo(droplist, 'add:clinician', this.addClinicianGroup);
  },
  addClinicianGroup(group) {
    this.clinicianGroups.add(group);
    this.groups.remove(group);
    group.addClinician(this.clinician);
  },
  removeClinicianGroup(group) {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: renderTemplate(hbs`{{formatMessage (intlGet "admin.shared.cliniciansComponents.groupsComponent.removeModal.bodyText") group=group role=role}}`, {
        group: group.get('name'),
        role: this.clinician.getRole().get('name'),
      }),
      headingText: i18n.groupsComponent.removeModal.headingText,
      submitText: i18n.groupsComponent.removeModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.clinicianGroups.remove(group);
        this.groups.add(group);
        group.removeClinician(this.clinician);
      },
    });
  },
});

const StateComponent = View.extend({
  className() {
    if (this.model.isActive()) return 'clinician-state--active';

    return 'clinician-state--pending';
  },
  getTemplate() {
    if (this.model.isActive()) return hbs`{{fas "check-circle"}}{{#unless isCompact}}<span class="clinician-state__label">{{ @intl.admin.shared.cliniciansComponents.stateComponent.active }}</span>{{/unless}}`;

    return hbs`{{fas "adjust"}}{{#unless isCompact}}<span class="clinician-state__label">{{ @intl.admin.shared.cliniciansComponents.stateComponent.pending }}</span>{{/unless}}`;
  },
  templateContext() {
    return {
      isCompact: this.getOption('isCompact'),
    };
  },
});

export {
  AccessComponent,
  GroupsComponent,
  RoleComponent,
  StateComponent,
};
