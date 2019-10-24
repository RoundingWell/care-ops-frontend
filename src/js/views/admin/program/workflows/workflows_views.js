import moment from 'moment';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/buttons.scss';

import PreloadRegion from 'js/regions/preload_region';

import { PublishedComponent } from 'js/views/admin/actions/actions_views';

import ActionItemTemplate from './action-item.hbs';
import LayoutTemplate from './layout.hbs';

import './workflows.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="workflows__empty-list">
      <h2>{{ @intl.admin.program.workflows.workflowsViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
  },
  className() {
    if (this.model.isNew()) return 'table-list__item is-selected';

    return 'table-list__item';
  },
  tagName: 'tr',
  template: ActionItemTemplate,
  regions: {
    published: '[data-published-region]',
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'program:action', this.model.get('_program'), this.model.id);
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  onRender() {
    this.showPublished();
  },
  showPublished() {
    const isDisabled = this.model.isNew();
    const publishedComponent = new PublishedComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(publishedComponent, 'change:published', published => {
      this.model.save({ published });
    });

    this.showChildView('published', publishedComponent);
  },
});


const ListView = CollectionView.extend({
  className: 'table-list workflows__list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
  viewComparator({ model }) {
    return - moment(model.get('updated_at')).format('X');
  },
});

const LayoutView = View.extend({
  className: 'flex-region workflows__content',
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
  },
  template: LayoutTemplate,
  triggers: {
    'click .js-add': 'click:add',
  },
});

export {
  ListView,
  LayoutView,
};
