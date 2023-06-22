import Backbone from 'backbone';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';

import App from 'js/base/app';

import intl from 'js/i18n';

import { ACTION_SHARING } from 'js/static';

import { LayoutView, MenuView } from 'js/views/patients/sidebar/action/action-sidebar_views';
import { ActionView, ReadOnlyActionView } from 'js/views/patients/sidebar/action/action-sidebar-action_views';
import { FormLayoutView } from 'js/views/patients/sidebar/action/action-sidebar-forms_views';
import { CommentFormView } from 'js/views/patients/shared/comments_views';
import { ActivitiesView, TimestampsView } from 'js/views/patients/sidebar/action/action-sidebar-activity-views';
import { AttachmentsView } from 'js/views/patients/sidebar/action/action-sidebar-attachments-views';

export default App.extend({
  onBeforeStart({ action, isShowingForm }) {
    this.action = action;
    this.isShowingForm = isShowingForm;

    this.setView(new LayoutView({ model: this.action }));

    const flow = this.action.getFlow();
    if (flow) this.listenTo(flow, 'change:_state', this.showAction);
    this.listenTo(action, 'change:_owner', this.onChangeOwner);
    this.showAction();
    this.showForm();

    if (!this.action.isNew()) this.getRegion('activity').startPreloader();

    this.showView();
  },
  onBeforeStop() {
    const flow = this.action.getFlow();
    if (flow) this.stopListening(flow);
    this.stopListening(this.action);
    this.canEdit = null;
  },
  beforeStart() {
    if (this.action.isNew()) return;

    return [
      Radio.request('entities', 'fetch:actionEvents:collection', this.action.id),
      Radio.request('entities', 'fetch:comments:collection:byAction', this.action.id),
      Radio.request('entities', 'fetch:files:collection:byAction', this.action.id),
    ];
  },
  onChangeOwner() {
    this.showAction();
    /* istanbul ignore else : Covers edge case when owner changes prior to beforeStart */
    if (this.isRunning()) this.showAttachments();
  },
  onStart(options, activity, comments, attachments) {
    if (this.action.isNew()) return;

    this.activityCollection = new Backbone.Collection([...activity.models, ...comments.models]);
    this.attachments = attachments;

    this.showActivity();
    this.showNewCommentForm();
    this.showAttachments();
  },
  viewEvents: {
    'close': 'stop',
  },
  isFlowDone() {
    const flow = this.action.getFlow();
    return flow && flow.isDone();
  },
  showAction() {
    const canEdit = !this.isFlowDone() && this.action.canEdit();

    if (canEdit === this.canEdit) return;

    this.canEdit = canEdit;
    const model = this.action;

    if (!canEdit) {
      this.getRegion('menu').empty();
      this.showChildView('action', new ReadOnlyActionView({ model }));
      return;
    }

    const menuView = this.showChildView('menu', new MenuView({ model }));

    this.listenTo(menuView, 'delete', this.onDelete);

    const actionView = this.showChildView('action', new ActionView({ model }));

    this.listenTo(actionView, {
      'save': this.onSave,
      'close': this.stop,
    });
  },
  showForm() {
    if (!this.action.getForm() && !this.action.hasSharing()) return;

    const formView = this.showChildView('form', new FormLayoutView({
      model: this.action,
      isShowingForm: this.isShowingForm,
    }));

    this.listenTo(formView, {
      'click:form': this.onClickForm,
      'click:share': this.onClickShare,
      'click:cancelShare': this.onClickCancel,
      'click:undoCancelShare': this.onClickUndoCancel,
    });
  },
  showActivity() {
    this.showChildView('activity', new ActivitiesView({
      collection: this.activityCollection,
      model: this.action,
    }));
    const createdEvent = this.activityCollection.find({ event_type: 'ActionCreated' });

    this.showChildView('timestamps', new TimestampsView({ model: this.action, createdEvent }));
  },
  showNewCommentForm() {
    const clinician = Radio.request('bootstrap', 'currentUser');

    const newCommentFormView = this.showChildView('comment', new CommentFormView({
      model: Radio.request('entities', 'comments:model', {
        _action: this.action.id,
        _clinician: clinician.id,
      }),
    }));

    this.listenTo(newCommentFormView, {
      'post:comment': this.onPostNewComment,
      'cancel:comment': this.onCancelNewComment,
    });
  },
  showAttachments() {
    const canUploadAttachments = !!Radio.request('bootstrap', 'setting', 'upload_attachments') && this.action.hasAllowedUploads();

    if (!canUploadAttachments && !this.attachments.length) return;

    const attachmentsView = new AttachmentsView({
      collection: this.attachments,
      canUploadAttachments,
      canRemoveAttachments: this.action.canEdit(),
    });

    this.listenTo(attachmentsView, {
      'add:attachment': this.onAddAttachment,
      'remove:attachment': this.onRemoveAttachment,
    });

    this.showChildView('attachments', attachmentsView);
  },
  onAddAttachment(file) {
    const attachment = this.attachments.add({
      _action: this.action.id,
      _patient: this.action.getPatient().id,
      created_at: dayjs.utc().format(),
    });
    attachment.upload(file);

    this.listenTo(attachment, 'upload:failed', () => {
      Radio.request('alert', 'show:error', intl.patients.sidebar.actionSidebarApp.uploadError);
    });
  },
  onRemoveAttachment(model) {
    model.destroy();
  },
  onSave({ model }) {
    if (model.isNew()) {
      this.action.saveAll(model.attributes).then(() => {
        Radio.trigger('event-router', 'patient:action', this.action.get('_patient'), this.action.id);
      });
      return;
    }

    this.action.save(model.pick('name', 'details'));
  },
  onDelete() {
    this.action.destroy({ wait: true })
      .then(() => {
        this.stop();
      })
      .catch(({ responseData }) => {
        Radio.request('alert', 'show:apiError', responseData);
      });
  },
  onStop() {
    this.action.trigger('editing', false);
    if (this.action && this.action.isNew()) this.action.destroy();

    Radio.request('sidebar', 'close');
  },
  onClickForm(form) {
    Radio.trigger('event-router', 'form:patientAction', this.action.id, form.id);
  },
  onClickShare() {
    this.action.save({ sharing: ACTION_SHARING.PENDING });
  },
  onClickCancel() {
    this.action.save({ sharing: ACTION_SHARING.CANCELED });
  },
  onClickUndoCancel() {
    this.action.save({ sharing: ACTION_SHARING.PENDING });
  },
  onPostNewComment({ model }) {
    model.set({ created_at: dayjs.utc().format() }).save();
    this.activityCollection.add(model);
    this.showNewCommentForm();
  },
  onCancelNewComment() {
    this.showNewCommentForm();
  },
});
