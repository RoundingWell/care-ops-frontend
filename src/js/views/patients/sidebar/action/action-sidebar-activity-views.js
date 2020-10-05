import dayjs from 'dayjs';

import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import { alphaSort } from 'js/utils/sorting';

import { renderTemplate } from 'js/i18n';

import Tooltip from 'js/components/tooltip';

import { CommentFormView } from 'js/views/patients/shared/comments_views';

import 'sass/modules/comments.scss';
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

const ActionCopiedFromProgramActionTemplate = hbs`
  {{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.actionCopiedFromProgram") name = name role = role program = program}}
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

const CommentView = View.extend({
  className: 'u-margin--b-16',
  ui: {
    edit: '.js-edit',
  },
  triggers: {
    'click @ui.edit': 'click:edit',
  },
  childViewTriggers: {
    'cancel:comment': 'cancel:edit',
    'post:comment': 'save:comment',
    'delete:comment': 'delete:comment',
  },
  regions: {
    comment: '[data-comment-activity-region]',
  },
  template: hbs`
    <div data-comment-activity-region>
      <div class="comment__item">
        <div class="comment__author-label">{{ initials }}</div>
        <div class="comment__title">
          <span class="comment__author-name">{{ name }}</span>
          <span class="comment__timestamp">{{ formatMoment created_at "AT_TIME" }}</span>
          {{#if canEdit}}<span class="js-edit comment__edit">{{far "pen"}} {{ @intl.patients.sidebar.action.activityViews.commentView.edit }}</span>{{/if}}
        </div>
        <div class="comment__message">{{ message }}{{#if edited_at}}<span class="comment__edited"> {{ @intl.patients.sidebar.action.activityViews.commentView.edited }} </span>{{/if}}</div>
      </div>
    </div>
  `,
  templateContext() {
    const clinician = this.model.getClinician();
    const currentUser = Radio.request('bootstrap', 'currentUser');

    return {
      canEdit: clinician.id === currentUser.id,
      name: clinician.get('name'),
      initials: clinician.getInitials(),
    };
  },
  onRender() {
    const edited = this.model.get('edited_at');
    if (!edited) return;

    const template = hbs`{{formatHTMLMessage (intlGet "patients.sidebar.action.activityViews.commentView.editTooltip")  edited = (formatMoment edited "TIME") }}`;

    new Tooltip({
      messageHtml: renderTemplate(template, { edited }),
      uiView: this,
      ui: this.ui.edit,
    });
  },
  onClickEdit() {
    this.showChildView('comment', new CommentFormView({ model: this.model.clone() }));
  },
  onSaveComment({ model }) {
    this.model.save({
      message: model.get('message'),
      edited_at: dayjs.utc().format(),
    });
    this.render();
  },
  onCancelEdit() {
    this.render();
  },
  onDeleteComment() {
    this.model.destroy();
  },
});

const ActivityView = View.extend({
  className: 'action-sidebar__activity-item',
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
      ActionCopiedFromProgramAction: ActionCopiedFromProgramActionTemplate,
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
  childView(model) {
    return (model.type === 'events') ? ActivityView : CommentView;
  },
  viewFilter({ model }) {
    if (model.get('type') === 'ActionCreated' && this.model.get('_program_action')) return false;
    return true;
  },
  viewComparator(viewA, viewB) {
    return alphaSort('asc', this._getSortDate(viewA.model), this._getSortDate(viewB.model));
  },
  _getSortDate(model) {
    if (model.get('date')) return model.get('date');

    return model.get('created_at');
  },
});

const TimestampsView = View.extend({
  className: 'sidebar__footer flex',
  template: hbs`
    <div class="sidebar__footer-left"><h4 class="sidebar__label">{{ @intl.patients.sidebar.action.activityViews.createdAt }}</h4><div>{{formatMoment createdAt "AT_TIME"}}</div></div>
    <div><h4 class="sidebar__label">{{ @intl.patients.sidebar.action.activityViews.updatedAt }}</h4><div>{{formatMoment updated_at "AT_TIME"}}</div></div>
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
