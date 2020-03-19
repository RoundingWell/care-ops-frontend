import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/sidebar.scss';

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

const DueTimeUpdatedTemplate = hbs`
  {{#unless value}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.dueTimeCleared") name = name role = role }}
  {{else}}
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.dueTimeUpdated") name = name role = role time = (formatMoment value "LT" inputFormat="HH:mm:ss")}}
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

const FormUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.formUpdated") name = name role = role form = form}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const FormRespondedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.formResponded") name = name role = role form = form}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const FormRemovedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.formRemoved") name = name role = role form = form}}
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
    const type = this.model.get('type');

    const Templates = {
      ActionClinicianAssigned: ClinicianAssignedTemplate,
      ActionCreated: CreatedTemplate,
      ActionDetailsUpdated: DetailsUpdatedTemplate,
      ActionDueDateUpdated: DueDateUpdatedTemplate,
      ActionDueTimeUpdated: DueTimeUpdatedTemplate,
      ActionDurationUpdated: DurationUpdatedTemplate,
      ActionFormUpdated: FormUpdatedTemplate,
      ActionFormResponded: FormRespondedTemplate,
      ActionFormRemoved: FormRemovedTemplate,
      ActionNameUpdated: NameUpdatedTemplate,
      ActionProgramAssigned: ActionProgramAssignedTemplate,
      ActionRoleAssigned: RoleAssignedTemplate,
      ActionStateUpdated: StateUpdatedTemplate,
    };

    if (!Templates[type]) return hbs``;

    return Templates[type];
  },
  templateContext() {
    const editor = this.model.getEditor();
    const clinician = this.model.getClinician();
    const program = this.model.getProgram();
    const form = this.model.getForm();

    return {
      name: editor.get('name'),
      role: editor.getRole().get('name'),
      to_clinician: clinician.get('name'),
      to_role: this.model.getRole().get('name'),
      to_state: this.model.getState().get('name'),
      program: (program) ? program.get('name') : null,
      form: (form) ? form.get('name') : null,
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
  className: 'sidebar__timestamps',
  template: hbs`
    <div><h4 class="sidebar__label">{{ @intl.patients.sidebar.action.activityViews.createdAt }}</h4>{{formatMoment createdAt "AT_TIME"}}</div>
    <div><h4 class="sidebar__label">{{ @intl.patients.sidebar.action.activityViews.updatedAt }}</h4>{{formatMoment updated_at "AT_TIME"}}</div>
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
