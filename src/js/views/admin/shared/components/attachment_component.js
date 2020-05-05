import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

const i18n = intl.admin.shared.components.attachmentComponent;

const FormItemTemplate = hbs`{{far "poll-h"}} {{matchText text query}}`;
const FormTemplate = hbs`{{far "poll-h"}}{{ name }}`;
const NoFormTemplate = hbs`{{far "link"}}{{ @intl.admin.shared.components.attachmentComponent.defaultText }}`;

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
      className: 'button-secondary w-100',
      template: selected ? FormTemplate : NoFormTemplate,
    };
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
