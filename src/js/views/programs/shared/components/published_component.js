import { result } from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';

import 'scss/modules/buttons.scss';

import { PUBLISH_STATE_STATUS } from 'js/static';
import intl from 'js/i18n';

import Droplist from 'js/components/droplist';

import 'scss/domain/program-action-state.scss';

const i18n = intl.programs.shared.components.publishedComponent;

const ButtonCompactTemplate = hbs`<span class="{{ className }}">{{far icon}}</span>`;

const PublishedTemplate = hbs`<span class="{{ className }}">{{far icon}}<span>{{ name }}</span></span>`;

const PublishedStates = [
  {
    id: PUBLISH_STATE_STATUS.DRAFT,
    icon: 'edit',
    className: 'program-action--draft',
    name: i18n.draftText,
  },
  {
    id: PUBLISH_STATE_STATUS.PUBLISHED,
    icon: 'play-circle',
    className: 'program-action--published',
    name: i18n.publishedText,
  },
  {
    id: PUBLISH_STATE_STATUS.CONDITIONAL,
    icon: 'pause-circle',
    className: 'program-action--conditional',
    name: i18n.conditionalText,
  },
];

export default Droplist.extend({
  isCompact: false,
  initialize(options) {
    this.mergeOptions(options, ['status', 'isPublishedDisabled', 'isConditionalAvailable']);

    this.collection = new Backbone.Collection(PublishedStates);

    if (!result(this, 'isConditionalAvailable')) this.collection.remove(PUBLISH_STATE_STATUS.CONDITIONAL);

    this.setState({ selected: this.collection.get(this.status) });
  },
  // Overridden for flow component
  isPublishDisabled: false,
  isConditionalAvailable: true,
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
      className: isCompact ? 'button-secondary--compact' : 'button-secondary w-100',
      template: isCompact ? ButtonCompactTemplate : PublishedTemplate,
    };
  },
  picklistOptions() {
    const isDisabled = result(this, 'isPublishDisabled');

    return {
      headingText: i18n.headingText,
      itemClassName() {
        return isDisabled && this.model.id === PUBLISH_STATE_STATUS.PUBLISHED ? 'is-disabled' : '';
      },
      itemTemplate: PublishedTemplate,
      infoText: isDisabled ? i18n.flowStatusInfoText : null,
    };
  },
});
