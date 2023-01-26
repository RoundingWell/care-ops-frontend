import Backbone from 'backbone';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';

import App from 'js/base/app';

import intl from 'js/i18n';

import { ACTION_SHARING } from 'js/static';

import { LayoutView } from 'js/views/patients/sidebar/action/action-sidebar_views';
import { CommentFormView } from 'js/views/patients/shared/comments_views';
import { ActivitiesView, TimestampsView } from 'js/views/patients/sidebar/action/action-sidebar-activity-views';
import { AttachmentsView } from 'js/views/patients/sidebar/action/action-sidebar-attachments-views';

export default App.extend({
  onBeforeStart({ action, isShowingForm }) {
    this.action = action;

    this.showView(new LayoutView({
      action: this.action,
      isShowingForm,
    }));

    if (!this.action.isNew()) this.getRegion('activity').startPreloader();
  },
  beforeStart() {
    if (this.action.isNew()) return;

    return [
      Radio.request('entities', 'fetch:actionEvents:collection', this.action.id),
      Radio.request('entities', 'fetch:comments:collection:byAction', this.action.id),
      Radio.request('entities', 'fetch:files:collection:byAction', this.action.id),
    ];
  },
  onStart(options, activity, comments, attachments) {
    if (this.action.isNew()) return;

    this.activityCollection = new Backbone.Collection([...activity.models, ...comments.models]);
    this.attachments = attachments;

    this.showActivity();
    this.showNewCommentForm();
    // this.showAttachments();
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
    const attachmentsView = new AttachmentsView({ collection: this.attachments });

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
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
    'click:form': 'onClickForm',
    'click:share': 'onClickShare',
    'click:cancelShare': 'onClickCancel',
    'click:undoCancelShare': 'onClickUndoCancel',
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
