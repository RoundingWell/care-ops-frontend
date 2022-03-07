import { View, CollectionView } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import widgets, { buildWidget } from './widgets';

import './widgets.scss';

const WidgetView = View.extend({
  className() {
    return this.getOption('itemClassName');
  },
  template: hbs`{{#if definition.display_name}}<div class="widgets__heading">{{ definition.display_name }}</div>{{/if}}<div class="widgets__item" data-content-region></div>`,
  regions: {
    content: '[data-content-region]',
  },
  onRender() {
    const widget = this.getOption('widget');
    const patient = this.getOption('patient');

    this.showChildView('content', buildWidget(widget, patient, this.model));
  },
});

const WidgetCollectionView = CollectionView.extend({
  childView: WidgetView,
  childViewOptions(model) {
    const widget = widgets[model.get('widget_type')];

    return {
      itemClassName: this.getOption('itemClassName'),
      widget,
      model,
      patient: this.model,
    };
  },
  viewFilter({ model }) {
    return model.get('widget_type');
  },
  viewComparator: false,
});

export {
  WidgetCollectionView,
};
