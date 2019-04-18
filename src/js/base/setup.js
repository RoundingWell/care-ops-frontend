import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';
import Radio from 'backbone.radio';
import * as Marionette from 'marionette';
import { Component } from 'marionette.toolkit';
import './hotkeys';
import 'js/utils/formatting';

const { Region, View, CollectionView } = Marionette;

$.Deferred.exceptionHook = error => {
  throw error;
};

/* istanbul ignore if */
if (_DEVELOP_) {
  Radio.DEBUG = true;

  // Expose libraries for the console
  window._ = _;
  window.$ = $;
  window.Backbone = Backbone;
  window.Radio = Radio;
  window.Marionette = Marionette;
  window.moment = moment;
}

const getBounds = function(ui) {
  /* istanbul ignore if */
  if (!this.isAttached()) {
    return false;
  }

  // Allow for the user to get the bounds of a different ui elem
  const $el = ui || this.$el;

  const offset = $el.offset();
  const outerHeight = $el.outerHeight();
  const outerWidth = $el.outerWidth();

  return {
    left: offset.left,
    top: offset.top + outerHeight,
    heightOffset: outerHeight,
    widthOffset: outerWidth,
  };
};

const regionShow = Region.prototype.show;

// Allow for components to be shown directly in regions
Region.prototype.show = function(view, options) {
  if (view instanceof Component) {
    view.showIn(this, options);

    return this;
  }

  return regionShow.call(this, view, options);
};

_.extend(View.prototype, {
  getBounds,
});

_.extend(CollectionView.prototype, {
  getBounds,
});
