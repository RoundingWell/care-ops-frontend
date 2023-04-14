import { result } from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';

import { PROGRAM_BEHAVIORS } from 'js/static';
import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import 'scss/domain/program-action-state.scss';

const i18n = intl.programs.shared.components.publishedComponent;

const ButtonCompactTemplate = hbs`<span class="{{ className }}">{{far icon}}</span>`;

const PublishedTemplate = hbs`<span class="{{ className }}">{{far icon}}<span>{{ name }}</span></span>`;

const PublishedStates = [
  {
    icon: 'pen-to-square',
    className: 'program-action--draft',
    name: i18n.draftText,
    published: false,
    behavior: PROGRAM_BEHAVIORS.STANDARD,
  },
  {
    icon: 'circle-play',
    className: 'program-action--published',
    name: i18n.publishedText,
    published: true,
    behavior: PROGRAM_BEHAVIORS.STANDARD,
  },
  {
    icon: 'circle-pause',
    className: 'program-action--conditional',
    name: i18n.conditionalText,
    published: true,
    behavior: PROGRAM_BEHAVIORS.CONDITIONAL,
  },
  {
    icon: 'bolt',
    className: 'program-action--automated',
    name: i18n.automatedText,
    published: true,
    behavior: PROGRAM_BEHAVIORS.AUTOMATED,
  },
];

export default Droplist.extend({
  isCompact: false,
  initialize(options) {
    const { published, behavior } = options;
    this.mergeOptions(options, ['isPublishedDisabled', 'isConditionalAvailable']);

    this.collection = new Backbone.Collection(PublishedStates);

    if (!result(this, 'isConditionalAvailable')) {
      const conditional = this.collection.find({ behavior: PROGRAM_BEHAVIORS });
      this.collection.remove(conditional);
    }

    this.setSelected({ published, behavior });
  },
  // Overridden for flow component
  isPublishDisabled: false,
  isConditionalAvailable: true,
  onChangeSelected(selected) {
    const published = selected.get('published');
    const behavior = selected.get('behavior');
    this.triggerMethod('change:status', { published, behavior });
  },
  setSelected({ published, behavior }) {
    const selected = this.collection.find({ published, behavior });
    this.setState({ selected });
  },
  popWidth() {
    const isCompact = this.getOption('isCompact');

    return isCompact ? null : this.getView().$el.outerWidth();
  },
  viewOptions() {
    const isCompact = this.getOption('isCompact');

    return {
      className: isCompact ? 'button-secondary--compact' : 'button-secondary w-100',
      template: isCompact ? ButtonCompactTemplate : PublishedTemplate,
    };
  },
  picklistOptions() {
    const isDisabled = result(this, 'isPublishDisabled');

    return {
      headingText: i18n.headingText,
      itemClassName() {
        return isDisabled && this.model.get('published') ? 'is-disabled' : '';
      },
      itemTemplate: PublishedTemplate,
      infoText: isDisabled ? i18n.flowStatusInfoText : null,
    };
  },
});
