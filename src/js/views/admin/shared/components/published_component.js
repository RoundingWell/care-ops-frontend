import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import 'sass/domain/program-action-state.scss';

const i18n = intl.admin.shared.components.publishedComponent;

const ButtonCompactTemplate = hbs`<span class="{{ className }}">{{far icon}}</span>`;

const PublishedTemplate = hbs`<span class="{{ className }}">{{far icon}}{{ name }}</span>`;

const PublishedStates = [
  {
    id: 'draft',
    icon: 'edit',
    className: 'program-action--draft',
    name: i18n.draftText,
  },
  {
    id: 'published',
    icon: 'play-circle',
    className: 'program-action--published',
    name: i18n.publishedText,
  },
  {
    id: 'conditional',
    icon: 'pause-circle',
    className: 'program-action--conditional',
    name: i18n.conditionalText,
  },
];

export default Droplist.extend({
  isCompact: false,
  initialize({ status }) {
    this.collection = new Backbone.Collection(PublishedStates);

    if (!this.isConditionalAvailable()) this.collection.remove('conditional');

    this.setState({ selected: this.collection.get(status) });
  },
  // Overridden for flow component
  isPublishDisabled: () => false,
  isConditionalAvailable: () => true,
  onChangeSelected(selected) {
    this.triggerMethod('change:status', selected.id);
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: isCompact ? 'button-secondary--compact is-icon-only' : 'button-secondary w-100',
      template: isCompact ? ButtonCompactTemplate : PublishedTemplate,
    };
  },
  picklistOptions() {
    const isDisabled = this.isPublishDisabled();

    return {
      headingText: i18n.headingText,
      itemClassName() {
        return isDisabled && this.model.id === 'published' ? 'is-disabled' : '';
      },
      itemTemplate: PublishedTemplate,
      infoText: isDisabled ? i18n.flowStatusInfoText : null,
    };
  },
});
