import $ from 'jquery';
import _ from 'underscore';
import { Behavior } from 'marionette';

import KeyListener from './key-listener';


export default Behavior.extend({
  behaviors: {
    KeyListener: {
      'behaviorClass': KeyListener,
      'transport:down': _.DOWN_KEY,
      'transport:up': _.UP_KEY,
      'select': _.ENTER_KEY,
      'close': [_.ESCAPE_KEY, _.TAB_KEY],
    },
  },

  options: {

    // listLoop determines if arrowing above or below this list stops or
    // loops the highlight around to the bottom or top of the list respectively.
    listLoop: true,
    items: '.js-select-list-item',
  },

  events() {
    const evts = {};

    // by default 'mouseenter .js-select-list-item'
    evts[`mouseenter ${ this.getOption('items') }`] = this.onHoverItem;

    return evts;
  },

  shouldLoopList() {
    return !!this.getOption('listLoop');
  },

  // must be onAttach, so that the width of droplist is already set for scrolling calc
  onAttach() {
    const $items = this.getItems();
    this.scrollTo($items, 'middle');
  },

  onHoverItem(evt) {
    this.updateTransport(this.getItems(), $(evt.currentTarget));
  },

  onTransportDown(evt) {
    evt.preventDefault();

    const $items = this.getItems();
    const $highlighted = this._getNextHighlighted($items);

    this.updateTransport($items, $highlighted);

    this.scrollTo($items);
  },

  onTransportUp(evt) {
    evt.preventDefault();

    const $items = this.getItems();
    const $highlighted = this._getPrevHighlighted($items);

    this.updateTransport($items, $highlighted);

    this.scrollTo($items);
  },

  getItems() {
    return this.view.$(this.getOption('items'));
  },

  getHighlighted($items) {
    return $items.filter('.is-highlighted');
  },

  updateTransport($items, $highlighted) {
    $items.removeClass('is-highlighted');
    $highlighted.addClass('is-highlighted');
  },

  // determines based on what is highlighted (or not)
  // what the next highlighted item will be when arrow up is pushed
  _getPrevHighlighted($items) {
    const $highlighted = this.getHighlighted($items);

    if (!$highlighted.length) {
      return $items.last();
    }

    const nextIndex = $items.index($highlighted) - 1;

    if (nextIndex < 0) {
      if (!this.shouldLoopList()) return $highlighted;
      return $items.last();
    }

    return $items.eq(nextIndex);
  },

  // determines based on what is highlighted (or not)
  // what the next highlighted item will be when arrow down is pushed
  _getNextHighlighted($items) {
    const $highlighted = this.getHighlighted($items);

    if (!$highlighted.length) {
      return $items.first();
    }

    const nextIndex = $items.index($highlighted) + 1;

    if (nextIndex === $items.length) {
      if (!this.shouldLoopList()) return $highlighted;
      return $items.first();
    }

    return $items.eq(nextIndex);
  },

  // looks for the highlighted items position and scrolls the list so that it is shown.
  // pass 'middle' as the offsetDir to place the highlighted element in the middle
  // of the scrollable window
  scrollTo($items, offsetDir) {
    const $highlighted = this.getHighlighted($items);

    if (!$highlighted.length || !$items.length) return;

    const picklistScrollTop = this.view.$el.scrollTop();
    const picklistHeight = this.view.$el.outerHeight();
    const childViewHeight = $highlighted.outerHeight();
    const childViewTop = $highlighted.position().top;
    const childViewBottom = childViewTop + childViewHeight - picklistHeight;
    let offset = 0;

    if (offsetDir === 'middle') {
      offset = (picklistHeight / 2) - (childViewHeight / 2);
    }

    if (childViewTop < 0) {
      this.view.$el.scrollTop((picklistScrollTop + childViewTop) + offset);
    }

    if (childViewBottom > 0) {
      this.view.$el.scrollTop((picklistScrollTop + childViewBottom) + offset);
    }
  },


  // Keylistener non-transport related events
  // -----------------------------------------

  // simulates the click trigger on the currently highlighted element
  onSelect(evt) {
    evt.preventDefault();

    this.view.$('.is-highlighted').click();
  },

  // proxy the close method of the droplist
  onClose(evt) {
    const prefix = this.view.getOption('childViewEventPrefix');

    this.view.triggerMethod(`${ prefix }:close`);
  },
});
