import _ from 'underscore';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View, CollectionView, Behavior } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';
import { AccessComponent, RoleComponent } from 'js/views/admin/shared/clinicians_components';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';

const RowBehavior = Behavior.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'onChange',
  },
  onChange() {
    this.view.render();
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  onInitialize() {
    if (this.view.model.isNew()) this.$el.addClass('is-selected');
  },
});

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.admin.list.cliniciansAllViews.emptyView }}</h2>
    </td>
  `,
});

const ItemView = View.extend({
  className: 'table-list__item',
  behaviors: [RowBehavior],
  tagName: 'tr',
  regions: {
    role: '[data-role-region]',
    access: '[data-access-region]',
  },
  triggers: {
    'click': 'click',
  },
  template: hbs`
    <td class="table-list__cell w-20">{{#unless name}}{{ @intl.admin.list.cliniciansAllViews.itemView.newClinician }}{{/unless}}{{ name }}</td>
    <td class="table-list__cell w-40">{{#each groups}}{{#unless @first}}, {{/unless}}{{ this.name }}{{/each}}</td>
    <td class="table-list__cell w-30"><span class="u-margin--r-8" data-access-region></span><span data-role-region></span></td>
  `,
  templateContext() {
    return {
      groups: _.sortBy(_.map(this.model.getGroups().models, 'attributes'), 'name'),
    };
  },
  onRender() {
    this.showRole();
    this.showAccess();
  },
  onClick() {
    if (this.model.isNew()) {
      return;
    }

    Radio.trigger('event-router', 'clinician', this.model.id);
  },
  showAccess() {
    const accessComponent = new AccessComponent({ model: this.model, isCompact: true });

    this.listenTo(accessComponent, 'change:access', accessType => {
      this.model.save({ access: accessType });
    });

    this.showChildView('access', accessComponent);
  },
  showRole() {
    const roleComponent = new RoleComponent({ model: this.model, isCompact: true });

    this.listenTo(roleComponent, 'change:role', role => {
      this.model.saveRole(role);
    });

    this.showChildView('role', roleComponent);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: hbs`
    <div class="list-page__header">
      <div class="list-page__title">{{ @intl.admin.list.cliniciansAllViews.layoutView.title }}</div>
      <button class="button-primary js-add-clinician">{{far "plus-circle"}}{{ @intl.admin.list.cliniciansAllViews.layoutView.addClinicianButton }}</button>
    </div>
    <div class="flex-region list-page__list">
      <table class="w-100"><tr>
        <td class="table-list__header w-20">{{ @intl.admin.list.cliniciansAllViews.layoutView.clinicianHeader }}</td>
        <td class="table-list__header w-40">{{ @intl.admin.list.cliniciansAllViews.layoutView.groupsHeader }}</td>
        <td class="table-list__header w-30">{{ @intl.admin.list.cliniciansAllViews.layoutView.attributesHeader }}</td>
      </tr></table>
      <div class="flex-region" data-list-region></div>
    </div>
  `,
  regions: {
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
    sidebar: '[data-sidebar-region]',
    addClinician: {
      el: '[data-add-region]',
      replaceElement: true,
    },
  },
  triggers: {
    'click .js-add-clinician': 'click:addClinician',
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
  viewComparator({ model }) {
    return model.get('name');
  },
});

export {
  LayoutView,
  ListView,
};
