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

const PublishedComponent = Droplist.extend({
  isCompact: false,
  getTemplate() {
    if (this.getOption('isCompact')) {
      return hbs`<span class="{{ className }}">{{far icon}}</span>`;
    }

    return hbs`<span class="{{ className }}">{{far icon}}{{ name }}</span>`;
  },
  initialize({ model }) {
    this.collection = new Backbone.Collection([
      {
        status: 'draft',
        icon: 'edit',
        className: 'program-action--draft',
        name: i18n.publishedComponent.draftText,
      },
      {
        status: 'published',
        icon: 'play-circle',
        className: 'program-action--published',
        name: i18n.publishedComponent.publishedText,
        isDisabled: this.getOption('disablePublished'),
      },
    ]);

    this.setState({ selected: this.collection.find({ status: model.get('status') }) });
  },
  onPicklistSelect({ model }) {
    if (model.get('isDisabled')) {
      return;
    }
    this.setState('selected', model);
    this.popRegion.empty();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:status', selected.get('status'));
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100',
      template: this.getTemplate(),
    };
  },
  picklistOptions() {
    return {
      headingText: i18n.publishedComponent.headingText,
      getItemFormat({ attributes }) {
        const template = hbs`<span class="{{ className }}{{#if isDisabled}} is-disabled{{/if}}">{{far icon}}{{ name }}</span>`;
        return new Handlebars.SafeString(template(attributes));
      },
      infoText: this.getOption('infoText'),
    };
  },
});

const OwnerItemTemplate = hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}} <span class="program-actions__role">{{matchText short query}}</span></a>`;

const OwnerComponent = Droplist.extend({
  isCompact: false,
  getTemplate() {
    if (this.getOption('isCompact')) {
      return hbs`{{far "user-circle"}}{{ short }}`;
    }

    return hbs`{{far "user-circle"}}{{ name }}{{#unless name}}{{ @intl.admin.actions.actionsViews.ownerComponent.defaultText }}{{/unless}}`;
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions: _.extend({
    isSelectlist: true,
  }, i18n.ownerComponent),
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

    roles.unshift({
      id: null,
      name: i18n.ownerComponent.clear,
    });

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
  isCompact: false,
  getTemplate(day) {
    if (day === 0) {
      return hbs`{{far "stopwatch"}}{{ @intl.admin.actions.actionsViews.dueDayComponent.sameDay }}`;
    }
    if (!day && this.getOption('isCompact')) {
      return hbs`{{far "stopwatch"}}`;
    }
    if (!day) {
      return hbs`{{far "stopwatch"}}{{ @intl.admin.actions.actionsViews.dueDayComponent.defaultText }}`;
    }

    return hbs`{{far "stopwatch"}}{{ day }} {{formatMessage  (intlGet "admin.actions.actionsViews.dueDayComponent.unitLabel") day=day}}`;
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const day = this.getState('selected').get('day');

    return {
      className() {
        if (day === null && isCompact) {
          return 'button-secondary--compact is-icon-only';
        }
        if (isCompact) {
          return 'button-secondary--compact';
        }

        return 'button-secondary w-100';
      },
      template: this.getTemplate(day),
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
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:days_until_due', selected.get('day'));
  },
});

const AttachmentComponent = Droplist.extend({
  getTemplate() {
    const attachment = this.getState('selected');
    if (!attachment) {
      return hbs`{{far "link"}}{{ @intl.admin.actions.actionsViews.attachmentComponent.defaultText }}`;
    }
    return hbs`<span class="program-actions__form-icon">{{far "poll-h"}}</span>{{ name }}{{far "trash-alt" classes="program-actions__delete js-delete"}}`;
  },
  viewOptions() {
    const clearSelected = _.bind(this.setState, this, 'selected', null);

    return {
      className: 'button-secondary w-100',
      template: this.getTemplate(),
      events: {
        'click .js-delete'(evt) {
          evt.stopPropagation();
          clearSelected();
        },
      },
    };
  },
  picklistOptions: {
    headingText: i18n.attachmentComponent.headingText,
    placeholderText: i18n.attachmentComponent.placeholderText,
    noResultsText: i18n.attachmentComponent.noResultsText,
    isSelectlist: true,
    itemTemplate: hbs`<a{{#if isSelected}} class="is-selected"{{/if}}><span class="program-actions__form-icon">{{far "poll-h"}}</span> {{matchText text query}}</a>`,
    attr: 'name',
  },
  initialize({ model }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');

    this.collection = currentOrg.getForms();

    this.setState({ selected: model.getForm() });
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:form', selected);
  },
});

export {
  PublishedComponent,
  OwnerComponent,
  DueDayComponent,
  AttachmentComponent,
};
