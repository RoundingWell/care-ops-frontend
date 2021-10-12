import { extend } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import Backbone from 'backbone';

import AccessComponent from './components/access_component';
import RoleComponent from './components/role_component';
import GroupsManagerComponent from 'js/views/shared/components/groups-manager';

import intl, { renderTemplate } from 'js/i18n';

import Droplist from 'js/components/droplist';

import './clinician-state.scss';

const i18n = intl.admin.shared.clinicianViews;

const GroupsComponent = GroupsManagerComponent.extend({
  removeMemberGroup(group) {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: renderTemplate(hbs`{{formatMessage (intlGet "admin.shared.clinicianViews.groupsComponent.removeModal.bodyText") group=group role=role}}`, {
        group: group.get('name'),
        role: this.member.getRole().get('name'),
      }),
      headingText: i18n.groupsComponent.removeModal.headingText,
      submitText: i18n.groupsComponent.removeModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.memberGroups.remove(group);
        this.groups.add(group);
        this.triggerMethod('remove:member', this.member, group);
      },
    });
  },
});

function getClassName(isActive, isCompact) {
  if (!isActive) return isCompact ? 'clinician-state--compact' : 'clinician-state';

  return isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100';
}

function getTemplate(isActive) {
  if (!isActive) return hbs`<span class="clinician-state--pending">{{fas "adjust"}}{{#unless isCompact}}<span class="u-margin--l-8">{{ @intl.admin.shared.clinicianViews.stateComponent.pending }}</span>{{/unless}}</span>`;

  return hbs`<span class="clinician-state--{{ id }}">{{fa iconType icon}}{{#unless isCompact}}<span class="clinician-state__label">{{ name }}</span>{{/unless}}</span>`;
}

const StateTemplate = hbs`<span class="clinician-state--{{ id }}">{{fa iconType icon}}{{ name }}</span>`;

const States = [
  {
    id: 'disabled',
    iconType: 'far',
    icon: 'minus-circle',
    name: i18n.stateComponent.disabled,
  },
  {
    id: 'active',
    iconType: 'fas',
    icon: 'check-circle',
    name: i18n.stateComponent.active,
  },
];

const StateComponent = Droplist.extend({
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions() {
    return {
      headingText: i18n.stateComponent.headingText,
      itemTemplate: StateTemplate,
    };
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const isActive = this.getOption('isActive');
    const viewOptions = {
      className: getClassName(isActive, isCompact),
      tagName: isActive ? 'button' : 'span',
      template: getTemplate(isActive),
      templateContext: { isCompact },
    };

    if (!isActive) return extend(viewOptions, { triggers: {} });

    return viewOptions;
  },
  initialize({ selectedId }) {
    this.collection = new Backbone.Collection(States);
    this.setState('selected', this.collection.get(selectedId));
  },
});

export {
  AccessComponent,
  GroupsComponent,
  RoleComponent,
  StateComponent,
};
