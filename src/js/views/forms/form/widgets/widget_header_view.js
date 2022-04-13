import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/widgets.scss';

import { WidgetCollectionView } from 'js/views/patients/widgets/widgets_views';

import './widget_header.scss';

const FormWidgetsHeaderView = View.extend({
  className: 'form__widgets flex',
  template: hbs`<div data-widgets-region></div>`,
  regions: {
    widgets: '[data-widgets-region]',
  },
  onRender({ model, collection }) {
    this.showChildView('widgets', new WidgetCollectionView({
      model: model,
      collection: collection,
      className: 'flex flex-wrap',
      itemClassName: 'form__widgets-section',
    }));
  },
});

export {
  FormWidgetsHeaderView,
};
