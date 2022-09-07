import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import Backbone from 'backbone';

import RoleComponent from './components/role_component';
import TeamComponent from 'js/views/shared/components/team';
import GroupsManagerComponent from 'js/views/shared/components/groups-manager';

import intl, { renderTemplate } from 'js/i18n';

import Droplist from 'js/components/droplist';

import './clinician-state.scss';

const i18n = intl.clinicians.shared.clinicianViews;

const GroupsComponent = GroupsManagerComponent.extend({
  removeMemberGroup(group) {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: renderTemplate(hbs`{{formatMessage (intlGet "clinicians.shared.clinicianViews.groupsComponent.removeModal.bodyText") group=group team=team}}`, {
        group: group.get('name'),
        team: this.member.getTeam().get('name'),
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

const ActiveState = {
  id: 'enabled',
  state: 'active',
  icon: {
    type: 'fas',
    icon: 'circle-check',
  },
  name: i18n.stateComponent.active,
};

const PendingState = {
  id: 'enabled',
  state: 'pending',
  icon: {
    type: 'fas',
    icon: 'circle-half-stroke',
  },
  name: i18n.stateComponent.pending,
};

const DisabledState = {
  id: 'disabled',
  state: 'disabled',
  icon: {
    type: 'far',
    icon: 'circle-minus',
  },
  name: i18n.stateComponent.disabled,
};

const StateCompactTemplate = hbs`<span class="clinician-state--{{ state }}">{{fa icon.type icon.icon}}</span>`;

const StateTemplate = hbs`<span class="clinician-state--{{ state }}">{{fa icon.type icon.icon}}<span>{{ name }}</span></span>`;

const StateComponent = Droplist.extend({
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions() {
    return {
      itemTemplate: StateTemplate,
      headingText: i18n.stateComponent.headingText,
    };
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    return {
      className: isCompact ? 'button-secondary--compact' : 'button-secondary w-100',
      template: isCompact ? StateCompactTemplate : StateTemplate,
    };
  },
  initialize({ selectedId, isActive }) {
    this.collection = new Backbone.Collection([isActive ? ActiveState : PendingState, DisabledState]);
    this.setState('selected', this.collection.get(selectedId));
  },
});

export {
  RoleComponent,
  GroupsComponent,
  TeamComponent,
  StateComponent,
};
