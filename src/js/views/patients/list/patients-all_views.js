import _ from 'underscore';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

const ItemView = View.extend({
  template: hbs`
    {{ first_name }} {{ last_name }}
    {{#each groups}}
      <strong>{{ this.name }}</strong>
    {{/each}}
  `,
  className: 'patient-list__item',
  templateContext() {
    return {
      groups: _.map(this.model.getGroups().models, 'attributes'),
    };
  },
  triggers: {
    click: 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

const ListView = CollectionView.extend({
  childView: ItemView,
});

export {
  ListView,
};
