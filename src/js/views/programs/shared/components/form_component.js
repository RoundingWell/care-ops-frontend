import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import './form-component.scss';

const i18n = intl.programs.shared.components.formComponent;

const FormTemplate = hbs`
  <button class="js-button button-secondary button__group flex-grow" {{#if isDisabled}}disabled{{/if}}>
    {{far "square-poll-horizontal"}}<span>{{ name }}</span>
  </button><button class="js-click-form button button__group form-component__form-button" {{#if isDisabled}}disabled{{/if}}>{{fas "up-right-and-down-left-from-center"}}</button>
`;
const NoFormTemplate = hbs`
  <button class="js-button button-secondary w-100" {{#if isDisabled}}disabled{{/if}}>
    {{far "square-poll-horizontal"}}<span>{{ @intl.programs.shared.components.formComponent.defaultText }}</span>
  </button>
`;

let currentWorkspaceCache;
let formsCollection;

function getForms(workspace) {
  if (formsCollection) return formsCollection;
  formsCollection = workspace.getForms();
  const formModels = formsCollection.reject({ published_at: null });
  formsCollection.reset(formModels);
  return formsCollection;
}

export default Droplist.extend({
  viewOptions() {
    const selected = this.getState('selected');
    return {
      className: 'flex',
      template: selected ? FormTemplate : NoFormTemplate,
      templateContext() {
        return {
          isDisabled: this.getOption('state').isDisabled,
        };
      },
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
    itemTemplateContext: {
      icon: {
        type: 'far',
        icon: 'square-poll-horizontal',
      },
    },
    attr: 'name',
  },
  initialize({ form }) {
    const currentWorkspace = Radio.request('workspace', 'current');

    if (currentWorkspaceCache !== currentWorkspace.id) {
      formsCollection = null;
      currentWorkspaceCache = currentWorkspace.id;
    }

    this.collection = getForms(currentWorkspace);

    this.setState({ selected: form });
  },
  popWidth() {
    return this.getView().$el.outerWidth();
  },
  onChangeSelected(selected) {
    this.triggerMethod('change:form', selected);
  },
});
