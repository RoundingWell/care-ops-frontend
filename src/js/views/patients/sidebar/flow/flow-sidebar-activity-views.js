import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

const ProgramStartedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.flow.activityViews.programStarted") name = name role = role program = program}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ClinicianAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.flow.activityViews.clinicianAssigned") name = name role = role to_name = to_clinician}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const DetailsUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.flow.activityViews.detailsUpdated") name = name role = role}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const NameUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.flow.activityViews.nameUpdated") name = name role = role to_name = value from_name = previous}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const RoleAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.flow.activityViews.roleAssigned") name = name role = role to_role = to_role}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const StateUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.flow.activityViews.stateUpdated") name = name role = role to_state = to_state}}
  <div>{{formatMoment date "AT_TIME"}}</div>
`;

const ActivityView = View.extend({
  className: 'u-margin--b-8',
  getTemplate() {
    const type = this.model.get('type');

    const Templates = {
      FlowProgramStarted: ProgramStartedTemplate,
      FlowClinicianAssigned: ClinicianAssignedTemplate,
      FlowDetailsUpdated: DetailsUpdatedTemplate,
      FlowNameUpdated: NameUpdatedTemplate,
      FlowRoleAssigned: RoleAssignedTemplate,
      FlowStateUpdated: StateUpdatedTemplate,
    };

    if (!Templates[type]) return hbs``;

    return Templates[type];
  },
  templateContext() {
    const editor = this.model.getEditor();
    const clinician = this.model.getClinician();
    const program = this.model.getProgram();

    return {
      name: editor.get('name'),
      role: editor.getRole().get('name'),
      program: (program) ? program.get('name') : null,
      to_clinician: clinician.get('name'),
      to_role: this.model.getRole().get('name'),
      to_state: this.model.getState().get('name'),
    };
  },
});

const ActivitiesView = CollectionView.extend({
  childView: ActivityView,
});

export { ActivitiesView };
