import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';

import Droplist from 'js/components/droplist';

import intl from 'js/i18n';

const RoleItemTemplate = hbs`<a{{#if isSelected}} class="is-selected"{{/if}}>{{matchText name query}} <span class="clinician__role">{{matchText short query}}</span></a>`;

const RoleComponent = Droplist.extend({
  isCompact: false,
  getTemplate() {
    if (this.getOption('isCompact')) {
      return hbs`{{far "user-circle"}}{{ short }}`;
    }

    return hbs`{{far "user-circle"}}{{ name }}{{#unless name}}{{ @intl.admin.shared.cliniciansComponents.roleComponent.roleDefaultText }}{{/unless}}`;
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
    const roles = currentOrg.getRoles();

    this.lists = [{
      collection: roles,
      itemTemplate: RoleItemTemplate,
      headingText: intl.admin.shared.cliniciansComponents.roleComponent.rolesHeadingText,
      attr: 'name',
    }];

    this.setState({ selected: roles.get(model.get('_role')) });
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:role', selected);
  },
});

export {
  RoleComponent,
};
