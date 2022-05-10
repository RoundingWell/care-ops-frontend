import { View } from 'marionette';
import hbs from 'handlebars-inline-precompile';

import 'sass/modules/forms.scss';

import InputWatcherBehavior from 'js/behaviors/input-watcher';

import './list-search-component.scss';

const InputTemplate = hbs`
  <span class="list-search__search-icon">{{far "search"}}</span>
  <input class="list-search__input input-primary--small js-input w-100" type="text" {{#if isDisabled}}disabled{{/if}} placeholder="{{@intl.shared.components.listSearch.listSearchViews.placeholder}}"/>
  <span class="list-search__clear-icon js-clear is-hidden">{{fas "times-circle"}}</span>
`;

const SearchView = View.extend({
  behaviors: {
    InputWatcherBehavior,
  },
  className: 'list-search__container',
  template: InputTemplate,
  templateContext() {
    return {
      isDisabled: this.getOption('state').isDisabled,
      query: this.getOption('state').query,
    };
  },
  ui: {
    input: '.js-input',
    clear: '.js-clear',
  },
  triggers: {
    'click @ui.clear': 'clear',
  },
  onWatchChange(text) {
    this.ui.clear.toggleClass('is-hidden', !text.length);
  },
  onClear() {
    this.ui.input.val('');
    this.ui.clear.addClass('is-hidden');
  },
  onRender() {
    this.$el.toggleClass('is-disabled', this.getOption('state').isDisabled);
  },
});

export {
  SearchView,
};
