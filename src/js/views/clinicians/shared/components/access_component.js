import hbs from 'handlebars-inline-precompile';
import Backbone from 'backbone';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import { ACCESS_TYPES } from 'js/static';

import './access-component.scss';

const i18n = intl.clinicians.shared.components.accessComponent;

const ItemTemplate = hbs`<div>{{ name }}</div><div class="access-component__details">{{ details }}</div>`;

export default Droplist.extend({
  collection: new Backbone.Collection(ACCESS_TYPES),
  isCompact: false,
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  picklistOptions: {
    headingText: i18n.headingText,
    itemTemplate: ItemTemplate,
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: isCompact ? 'button-secondary' : 'button-secondary w-100',
      templateContext: {
        attr: 'name',
        icon: {
          type: 'far',
          icon: 'shield',
        },
      },
    };
  },
  initialize({ access }) {
    this.setState({ selected: this.collection.get(access) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:access', selected.id);
  },
});
