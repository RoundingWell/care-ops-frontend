import _ from 'underscore';
import Handlebars from 'handlebars/runtime';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl, { renderTemplate } from 'js/i18n';

import Droplist from 'js/components/droplist';

import 'sass/domain/program-action-state.scss';
import './actions.scss';

const i18n = intl.admin.actions.actionsViews;

const PublishedTemplate = hbs`<span class="{{ className }}">{{far icon}}{{ name }}</span>`;

const PublishedComponent = Droplist.extend({
  isCompact: false,
  initialize({ model }) {
    this.collection = new Backbone.Collection([
      {
        published: false,
        icon: 'edit',
        className: 'program-action--draft',
        name: i18n.publishedComponent.draftText,
      },
      {
        published: true,
        icon: 'play-circle',
        className: 'program-action--published',
        name: i18n.publishedComponent.publishedText,
      },
    ]);
    this.setState({ selected: this.collection.find({ published: model.get('published') }) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:published', selected.get('published'));
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: isCompact ? 'button-secondary--compact' : 'button-secondary w-100',
      template: PublishedTemplate,
    };
  },
  picklistOptions: {
    headingText: i18n.publishedComponent.headingText,
    getItemFormat({ attributes }) {
      return new Handlebars.SafeString(PublishedTemplate(attributes));
    },
  },
});

const OwnerItemTemplate = hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}} <span class="program-actions__role">{{matchText short query}}</span></a>`;

const OwnerComponent = Droplist.extend({
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  picklistOptions: _.extend({
    isSelectlist: true,
  }, i18n.ownerComponent),
  viewOptions: {
    modelEvents: {
      'change:_role': 'render',
    },
    className: 'button-secondary w-100',
    template: hbs`{{far "user-circle"}}{{ name }}{{#unless name}}{{ @intl.admin.actions.actionsViews.ownerComponent.defaultText }}{{/unless}}`,
  },
  initialize({ model }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const roles = currentOrg.getRoles();

    this.lists = [{
      collection: roles,
      itemTemplate: OwnerItemTemplate,
      headingText: i18n.ownerComponent.rolesHeadingText,
      getItemSearchText() {
        return this.$el.text();
      },
    }];

    this.setState({ selected: model.getRole() });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:owner', selected);
  },
});

const days = _.map(_.range(100), function(day) {
  return { day };
});

days.unshift({ day: null });

const DueDayComponent = Droplist.extend({
  getTemplate() {
    const day = this.getState('selected').get('day');
    if (day === 0) {
      return hbs`{{far "stopwatch"}}{{ @intl.admin.actions.actionsViews.dueDayComponent.sameDay }}`;
    }
    if (!day) {
      return hbs`{{far "stopwatch"}}{{ @intl.admin.actions.actionsViews.dueDayComponent.defaultText }}`;
    }
    return hbs`{{far "stopwatch"}}{{ day }} {{formatMessage  (intlGet "admin.actions.actionsViews.dueDayComponent.unitLabel") day=day}}`;
  },
  viewOptions() {
    return {
      className: 'button-secondary w-100',
      template: this.getTemplate(),
    };
  },
  picklistOptions: {
    headingText: i18n.dueDayComponent.headingText,
    placeholderText: i18n.dueDayComponent.placeholderText,
    isSelectlist: true,
    getItemFormat(item) {
      const day = item.get('day');
      if (day === 0) {
        return i18n.dueDayComponent.sameDay;
      }
      if (!day) {
        return i18n.dueDayComponent.clear;
      }
      const template = hbs`{{ day }} {{formatMessage  (intlGet "admin.actions.actionsViews.dueDayComponent.unitLabel") day=day}}`;
      return new Handlebars.SafeString(renderTemplate(template, { day }));
    },
  },
  initialize({ model }) {
    this.collection = new Backbone.Collection(days);
    const selected = this.collection.find({ day: model.get('days_until_due') });

    this.setState({ selected });
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:days_until_due', selected.get('day'));
  },
});

export {
  PublishedComponent,
  OwnerComponent,
  DueDayComponent,
};
