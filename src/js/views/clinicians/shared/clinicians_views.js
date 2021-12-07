import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import Backbone from 'backbone';

import AccessComponent from './components/access_component';
import RoleComponent from 'js/views/shared/components/role';
import GroupsManagerComponent from 'js/views/shared/components/groups-manager';

import intl, { renderTemplate } from 'js/i18n';

import Droplist from 'js/components/droplist';

import './clinician-state.scss';

const i18n = intl.clinicians.shared.clinicianViews;

const GroupsComponent = GroupsManagerComponent.extend({
  removeMemberGroup(group) {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: renderTemplate(hbs`{{formatMessage (intlGet "clinicians.shared.clinicianViews.groupsComponent.removeModal.bodyText") group=group role=role}}`, {
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

const StateTemplate = hbs`<span class="clinician-state--{{ state }}">{{fa iconType icon}}{{ name }}</span>`;

const StateItemTemplate = hbs`<span class="clinician-state--{{ state }}">{{fa iconType icon}}{{#unless isCompact}}<span class="clinician-state__label">{{ name }}</span>{{/unless}}</span>`;

const ActiveState = {
  id: 'enabled',
  state: 'active',
  iconType: 'fas',
  icon: 'check-circle',
  name: i18n.stateComponent.active,
};

const PendingState = {
  id: 'enabled',
  state: 'pending',
  iconType: 'fas',
  icon: 'adjust',
  name: i18n.stateComponent.pending,
};

const DisabledState = {
  id: 'disabled',
  state: 'disabled',
  iconType: 'far',
  icon: 'minus-circle',
  name: i18n.stateComponent.disabled,
};

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
    return {
      className: isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100',
      template: StateItemTemplate,
      templateContext: { isCompact },
    };
  },
  initialize({ selectedId, isActive }) {
    this.collection = new Backbone.Collection([isActive ? ActiveState : PendingState, DisabledState]);
    this.setState('selected', this.collection.get(selectedId));
  },
});

export {
  AccessComponent,
  GroupsComponent,
  RoleComponent,
  StateComponent,
};
