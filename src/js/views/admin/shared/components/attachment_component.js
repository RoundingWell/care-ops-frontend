import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './attachment-component.scss';

const i18n = intl.admin.shared.components.attachmentComponent;

const FormItemTemplate = hbs`{{far "poll-h"}} {{matchText text query}}`;
const FormTemplate = hbs`
  <button class="js-button button-secondary button__group flex-grow">
    {{far "poll-h"}}{{ name }}
  </button><button class="js-click-form button button__group attachment-component__form-button">{{far "expand-alt"}}</button>
`;
const NoFormTemplate = hbs`
  <button class="js-button button-secondary w-100">
    {{far "link"}}{{ @intl.admin.shared.components.attachmentComponent.defaultText }}
  </button>
`;

let formsCollection;

function getForms() {
  if (formsCollection) return formsCollection;
  const currentOrg = Radio.request('bootstrap', 'currentOrg');
  formsCollection = currentOrg.getForms();
  return formsCollection;
}

export default Droplist.extend({
  viewOptions() {
    const selected = this.getState('selected');
    return {
      className: 'flex',
      template: selected ? FormTemplate : NoFormTemplate,
      tagName: 'div',
      triggers: {
        'click .js-button': 'click',
        'focus .js-button': 'focus',
        'click .js-click-form': 'click:form',
      },
    };
  },
  viewEvents: {
    'click': 'onClick',
    'click:form': 'onViewClickForm',
  },
  onViewClickForm() {
    this.triggerMethod('click:form', this.getState('selected'));
  },
  picklistOptions: {
    canClear: true,
    headingText: i18n.headingText,
    placeholderText: i18n.placeholderText,
    noResultsText: i18n.noResultsText,
    isSelectlist: true,
    itemTemplate: FormItemTemplate,
    attr: 'name',
  },
  initialize({ form }) {
    this.collection = getForms();

    this.setState({ selected: form });
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:form', selected);
  },
});
