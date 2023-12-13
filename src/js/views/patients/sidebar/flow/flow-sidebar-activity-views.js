import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import './flow-sidebar.scss';

const ProgramStartedTemplate = hbs`
  {{formatHTMLMessage (intlGet (getI18nSource "programStarted")) name = name team = team program = program}}
  <div>{{formatDateTime date "AT_TIME"}}</div>
`;

const ClinicianAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet (getI18nSource "clinicianAssigned")) name = name team = team to_name = to_clinician}}
  <div>{{formatDateTime date "AT_TIME"}}</div>
`;

const DetailsUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet (getI18nSource "detailsUpdated")) name = name team = team}}
  <div>{{formatDateTime date "AT_TIME"}}</div>
`;

const NameUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet (getI18nSource "nameUpdated")) name = name team = team to_name = value from_name = previous}}
  <div>{{formatDateTime date "AT_TIME"}}</div>
`;

const TeamAssignedTemplate = hbs`
  {{formatHTMLMessage (intlGet (getI18nSource "teamAssigned")) name = name team = team to_team = to_team}}
  <div>{{formatDateTime date "AT_TIME"}}</div>
`;

const StateUpdatedTemplate = hbs`
  {{formatHTMLMessage (intlGet (getI18nSource "stateUpdated")) name = name team = team to_state = to_state}}
  <div>{{formatDateTime date "AT_TIME"}}</div>
`;

const ActivityView = View.extend({
  className: 'patient-flow-sidebar__activity-item',
  getTemplate() {
    const type = this.model.get('event_type');

    const Templates = {
      FlowProgramStarted: ProgramStartedTemplate,
      FlowClinicianAssigned: ClinicianAssignedTemplate,
      FlowDetailsUpdated: DetailsUpdatedTemplate,
      FlowNameUpdated: NameUpdatedTemplate,
      FlowTeamAssigned: TeamAssignedTemplate,
      FlowStateUpdated: StateUpdatedTemplate,
    };

    if (!Templates[type]) return hbs``;

    return Templates[type];
  },
  templateContext() {
    const editor = this.model.getEditor();
    const clinician = this.model.getClinician();
    const program = this.model.getProgram();
    const sourceI18n = `patients.sidebar.flow.activityViews.${ this.model.getSource() }`;

    return {
      name: editor.get('name'),
      team: editor.getTeam().get('name'),
      program: (program) ? program.get('name') : null,
      to_clinician: clinician.get('name'),
      to_team: this.model.getTeam().get('name'),
      to_state: this.model.getState().get('name'),
      getI18nSource(key) {
        return `${ sourceI18n }.${ key }`;
      },
    };
  },
});

const ActivitiesView = CollectionView.extend({
  childView: ActivityView,
});

export { ActivitiesView };
