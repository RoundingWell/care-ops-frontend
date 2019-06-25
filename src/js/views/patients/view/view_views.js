import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

const ItemView = View.extend({
  template: hbs`{{ name }}`,
});

const ListView = CollectionView.extend({
  childView: ItemView,
});

export {
  ListView,
};
