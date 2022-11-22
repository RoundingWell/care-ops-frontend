import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import { alphaSort } from 'js/utils/sorting';

import 'scss/modules/sidebar.scss';

import './action-sidebar.scss';

const AttachmentView = View.extend({
  className: 'u-margin--t-16',
  template: hbs`
    <a class="action-sidebar__attachment-filename" target="_blank" href={{path}}>{{filename}}</a>
    <div>
      <a class="action-sidebar__attachment-download" href={{path}} download>
        {{far "download"}} <span>{{ @intl.patients.sidebar.action.attachmentsViews.attachmentView.downloadText }}</span>
      </a>
    </div>
  `,
  templateContext() {
    return {
      filename: this.model.get('path').split('/').pop(),
    };
  },
});

const AttachmentsView = CollectionView.extend({
  className: 'u-margin--t-24',
  template: hbs`
    <div class="sidebar__attachments">
      <h3 class="sidebar__heading">
        {{far "paperclip"}}<span class="u-margin--l-8">{{ @intl.patients.sidebar.action.attachmentsViews.attachmentsHeadingText }}</span>
      </h3>
      <div data-attachments-files-region></div>
    </div>
  `,
  childViewContainer: '[data-attachments-files-region]',
  childView: AttachmentView,
  viewComparator(viewA, viewB) {
    return alphaSort('desc', viewA.model.get('created_at'), viewB.model.get('created_at'));
  },
});

export {
  AttachmentsView,
};
