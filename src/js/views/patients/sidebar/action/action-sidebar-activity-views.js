import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import './action-sidebar.scss';

const CreatedTemplate = hbs`
  {{#with metadata.editor}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.created") name = name role = role.name}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ClinicianAssignedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.clinicianAssigned") name = editor.name role = editor.role.name to_name = value.to.name}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DetailsUpdatedTemplate = hbs`
  {{#with metadata.editor}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.detailsUpdated") name = name role = role.name}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DueDateUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.dueDateUpdated") name = editor.name role = editor.role.name date = (formatMoment value.to "LONG")}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DurationUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.durationUpdated") name = editor.name role = editor.role.name duration = (formatDuration value.to "minutes")}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const NameUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.nameUpdated") name = editor.name role = editor.role.name to_name = value.to from_name = value.from}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const RoleAssignedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.roleAssigned") name = editor.name role = editor.role.name to_role = value.to.name}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const StateUpdatedTemplate = hbs`
  {{#with metadata}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.stateUpdated") name = editor.name role = editor.role.name to_state = value.to}}
  {{/with}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ActivityView = View.extend({
  className: 'u-margin--b-8',
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
