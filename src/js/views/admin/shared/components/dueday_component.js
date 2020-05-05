import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

const i18n = intl.admin.shared.components.dueDayComponent;

const days = _.map(_.range(100), function(day) {
  return { id: day };
});

const SameDayTemplate = hbs`{{far "stopwatch"}}{{ @intl.admin.shared.components.dueDayComponent.sameDay }}`;

const NoDayCompactTemplate = hbs`{{far "stopwatch"}}`;

const NoDayTemplate = hbs`{{far "stopwatch"}}{{ @intl.admin.shared.components.dueDayComponent.defaultText }}`;

const DueDayTemplate = hbs`{{far "stopwatch"}}{{formatMessage  (intlGet "admin.shared.components.dueDayComponent.days") day=id}}`;

const itemTemplate = hbs`{{formatMessage  (intlGet "admin.shared.components.dueDayComponent.days") day=id}}`;

export default Droplist.extend({
  collection: new Backbone.Collection(days),
  isCompact: false,
  getClassName(day, isCompact) {
    if (day === null && isCompact) {
      return 'button-secondary--compact is-icon-only';
    }

    return isCompact ? 'button-secondary--compact' : 'button-secondary w-100';
  },
  getTemplate(day, isCompact) {
    if (day === 0) {
      return SameDayTemplate;
    }

    if (!day && isCompact) {
      return NoDayCompactTemplate;
    }

    return day ? DueDayTemplate : NoDayTemplate;
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');
    const selected = this.getState('selected');
    const day = selected ? selected.id : null;

    return {
      className: this.getClassName(day, isCompact),
      template: this.getTemplate(day, isCompact),
    };
  },
  picklistOptions: {
    canClear: true,
    headingText: i18n.headingText,
    placeholderText: i18n.placeholderText,
    isSelectlist: true,
    itemTemplate,
  },
  initialize({ day }) {
    const selected = this.collection.get(day);

    this.setState({ selected });
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    const day = selected ? selected.id : null;

    this.triggerMethod('change:day', day);
  },
});
