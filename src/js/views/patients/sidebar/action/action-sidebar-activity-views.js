import _ from 'underscore';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import './action-sidebar.scss';

const CreatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.created") name = name role = role}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ClinicianAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.clinicianAssigned") name = name role = role to_name = to_clinician}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ActionProgramAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.actionProgramAssigned") name = name role = role program = program}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DetailsUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.detailsUpdated") name = name role = role}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DueDateUpdatedTemplate = hbs`
  {{#unless value}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.dueDateCleared") name = name role = role }}
  {{else}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.dueDateUpdated") name = name role = role date = (formatMoment value "LONG")}}
  {{/unless}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DurationUpdatedTemplate = hbs`
  {{#unless value}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.durationCleared") name = name role = role}}
  {{else}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.durationUpdated") name = name role = role duration = value}}
  {{/unless}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const NameUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.nameUpdated") name = name role = role to_name = value from_name = previous}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const RoleAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.roleAssigned") name = name role = role to_role = to_role}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const StateUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.stateUpdated") name = name role = role to_state = to_state}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ActivityView = View.extend({
  className: 'u-margin--b-8',
  getTemplate() {
    const Templates = {
      ActionCreated: CreatedTemplate,
      ActionClinicianAssigned: ClinicianAssignedTemplate,
      ActionProgramAssigned: ActionProgramAssignedTemplate,
      ActionDetailsUpdated: DetailsUpdatedTemplate,
      ActionDueDateUpdated: DueDateUpdatedTemplate,
      ActionDurationUpdated: DurationUpdatedTemplate,
      ActionNameUpdated: NameUpdatedTemplate,
      ActionRoleAssigned: RoleAssignedTemplate,
      ActionStateUpdated: StateUpdatedTemplate,
    };

    return Templates[this.model.get('type')];
  },
  templateContext() {
    const editor = this.model.getEditor();
    const clinician = this.model.getClinician();
    const program = this.model.getProgram();
    const toClinician = _.trim(`${ clinician.get('first_name') } ${ clinician.get('last_name') }`);
    const role = editor.getRole().get('name');
    const name = _.trim(`${ editor.get('first_name') } ${ editor.get('last_name') }`);

    return {
      name,
      role,
      to_clinician: toClinician,
      to_role: this.model.getRole().get('name'),
      to_state: this.model.getState().get('name'),
      program: (program) ? program.get('name') : null,
    };
  },
});

const ActivitiesView = CollectionView.extend({
  childView: ActivityView,
  viewFilter({ model }) {
    if (model.get('type') === 'ActionCreated' && this.model.get('_program')) return false;
    return true;
  },
});

const TimestampsView = View.extend({
  className: 'action-sidebar__timestamps',
  template: hbs`
    <div><h4 class="action-sidebar__label">{{ @intl.patients.sidebar.action.activityViews.createdAt }}</h4>{{formatMoment createdAt "AT_TIME"}}</div>
    <div><h4 class="action-sidebar__label">{{ @intl.patients.sidebar.action.activityViews.updatedAt }}</h4>{{formatMoment updated_at "AT_TIME"}}</div>
  `,
  templateContext() {
    return {
      createdAt: this.getOption('createdEvent').get('date'),
    };
  },
});

export {
  ActivitiesView,
  TimestampsView,
};
