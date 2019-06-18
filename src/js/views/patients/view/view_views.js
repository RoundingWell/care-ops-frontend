import { View, CollectionView } from 'marionette';

import hbs from 'handlebars-inline-precompile';

const ItemView = View.extend({
  template: hbs`{{ name }}`,
});

const ListView = CollectionView.extend({
  childView: ItemView,
});

export {
  ListView,
};
