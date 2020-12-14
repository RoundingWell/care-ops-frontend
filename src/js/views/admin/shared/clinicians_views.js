import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View } from 'marionette';

import AccessComponent from './components/access_component';
import RoleComponent from './components/role_component';
import GroupsManagerComponent from 'js/components/groups-manager';

import intl, { renderTemplate } from 'js/i18n';

import './clinician-state.scss';

const i18n = intl.admin.shared.cliniciansComponents;

const GroupsComponent = GroupsManagerComponent.extend({
  removeMemberGroup(group) {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: renderTemplate(hbs`{{formatMessage (intlGet "admin.shared.cliniciansComponents.groupsComponent.removeModal.bodyText") group=group role=role}}`, {
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
