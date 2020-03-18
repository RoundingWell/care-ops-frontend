import _ from 'underscore';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View, CollectionView } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';
import Droplist from 'js/components/droplist';

import intl from 'js/i18n';

import 'sass/modules/list-pages.scss';
import 'sass/modules/table-list.scss';


const RoleItemTemplate = hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}} <span class="program-actions__role">{{matchText short query}}</span></a>`;

const RoleComponent = Droplist.extend({
  isCompact: false,
  getTemplate() {
    if (this.getOption('isCompact')) {
      return hbs`{{far "user-circle"}}{{ short }}`;
    }

    return hbs`{{far "user-circle"}}{{ name }}{{#unless name}}{{ @intl.admin.list.cliniciansAllViews.roleComponent.roleDefaultText.defaultText }}{{/unless}}`;
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions: {
    isSelectlist: true,
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const selected = this.getState('selected');
    return {
      modelEvents: {
        'change:_role': 'render',
      },
      className() {
        if (!selected && isCompact) {
          return 'button-secondary--compact is-icon-only';
        }

        if (isCompact) {
          return 'button-secondary--compact';
        }

        return 'button-secondary w-100';
      },
      template: this.getTemplate(),
    };
  },
  initialize({ model }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const roles = currentOrg.getActiveRoles();

    this.lists = [{
      collection: roles,
      itemTemplate: RoleItemTemplate,
      headingText: intl.admin.list.cliniciansAllViews.roleComponent.rolesHeadingText,
      getItemSearchText() {
        return this.$el.text();
      },
    }];

    this.setState({ selected: model.getRole() });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:role', selected);
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
  tagName: 'tr',
  regions: {
    role: '[data-role-region]',
  },
  template: hbs`
    <td class="table-list__cell w-20">{{ name }}</td>
    <td class="table-list__cell w-40">{{#each groups}}{{#unless @first}}, {{/unless}}{{ this.name }}{{/each}}</td>
    <td class="table-list__cell w-30" data-role-region></td>
  `,
  templateContext() {
    return {
      groups: _.sortBy(_.map(this.model.getGroups().models, 'attributes'), 'name'),
    };
  },
  onRender() {
    this.showRole();
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
    </div>
    <div class="flex-region list-page__list">
      <table class="w-100"><tr>
        <td class="table-list__header w-20">{{ @intl.admin.list.cliniciansAllViews.layoutView.clinicianHeader }}</td>
        <td class="table-list__header w-40">{{ @intl.admin.list.cliniciansAllViews.layoutView.groupsHeader }}</td>
        <td class="table-list__header w-30">{{ @intl.admin.list.cliniciansAllViews.layoutView.roleHeader }}</td>
      </tr></table>
      <div class="flex-region" data-list-region></div>
    </div>
  `,
  regions: {
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
  },
  triggers: {
    'click .js-add': 'click:add',
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView: ItemView,
  emptyView: EmptyView,
});

export {
  LayoutView,
  ListView,
};
