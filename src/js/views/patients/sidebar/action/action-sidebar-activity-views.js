import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import './action-sidebar.scss';

const CreatedTemplate = hbs`
  {{#with metadata.editor}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.created") first_name = first_name last_name = last_name role = role.name}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const ClinicianAssignedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.clinicianAssigned") first_name = editor.first_name last_name = editor.last_name role = editor.role.name to_first_name = value.to.first_name to_last_name = value.to.last_name}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const DetailsUpdatedTemplate = hbs`
  {{#with metadata.editor}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.detailsUpdated") first_name = first_name last_name = last_name role = role.name}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const DueDateUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.dueDateUpdated") first_name = editor.first_name last_name = editor.last_name role = editor.role.name date = (formatMoment value.to "LONG")}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const DurationUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.durationUpdated") first_name = editor.first_name last_name = editor.last_name role = editor.role.name duration = (formatDuration value.to "minutes")}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const NameUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.nameUpdated") first_name = editor.first_name last_name = editor.last_name role = editor.role.name to_name = value.to from_name = value.from}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const RoleAssignedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.roleAssigned") first_name = editor.first_name last_name = editor.last_name role = editor.role.name to_role = value.to.name}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const StateUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.stateUpdated") first_name = editor.first_name last_name = editor.last_name role = editor.role.name to_state = value.to.name}}
  {{/with}}
  <div>{{formatMoment date "LONG"}}</div>
`;

const ActivityView = View.extend({
  getTemplate() {
    const Templates = {
      ActionCreated: CreatedTemplate,
      ActionClinicianAssigned: ClinicianAssignedTemplate,
      ActionDetailsUpdated: DetailsUpdatedTemplate,
      ActionDueDateUpdated: DueDateUpdatedTemplate,
      ActionDurationUpdated: DurationUpdatedTemplate,
      ActionNameUpdated: NameUpdatedTemplate,
      ActionRoleAssigned: RoleAssignedTemplate,
      ActionStateUpdated: StateUpdatedTemplate,
    };

    return Templates[this.model.get('type')];
  },
});

const ActivitiesView = CollectionView.extend({
  childView: ActivityView,
});

const TimestampsView = View.extend({
  className: 'action-sidebar__timestamps',
  template: hbs`
    <p>{{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.createdAt") createdAt = (formatMoment createdAt "AT_TIME")}}</p>
    <p>{{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.updatedAt") updatedAt = (formatMoment updated_at "AT_TIME")}}</p>
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
