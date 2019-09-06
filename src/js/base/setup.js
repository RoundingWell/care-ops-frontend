import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import moment from 'moment';
import Radio from 'backbone.radio';
import * as Marionette from 'marionette';
import { Component } from 'marionette.toolkit';
import DomApi from './domapi';
import './fontawesome';
import './helpers';
import './hotkeys';
import './moment';
import './uuid';
import 'js/utils/formatting';


import * as Components from 'js/components';
const { Region, View, CollectionView, setDomApi } = Marionette;

setDomApi(DomApi);

// https://github.com/jquery/jquery/blob/3.4.1/src/deferred/exceptionHook.js
const rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;

/* istanbul ignore next: Exposes errors in async */
$.Deferred.exceptionHook = (error, stack) => {
  if (!error || !rerrorNames.test(error.name)) return;

  // eslint-disable-next-line no-console
  console.error(error.message, error.stack, stack);
};

/* istanbul ignore if */
if (_DEVELOP_) {
  Radio.DEBUG = true;
}

// Expose libraries for the console
window._ = _;
window.$ = $;
window.Backbone = Backbone;
window.Radio = Radio;
window.Marionette = Marionette;
window.moment = moment;

// Expose components for testing
window.Components = Components;

const regionShow = Region.prototype.show;

// Allow for components to be shown directly in regions
Region.prototype.show = function(view, options) {
  if (view instanceof Component) {
    view.showIn(this, null, options);

    return this;
  }

  return regionShow.call(this, view, options);
};

const getBounds = function(ui) {
  /* istanbul ignore if */
  if (!this.isAttached()) {
    return false;
  }

  // Allow for the user to get the bounds of a different ui elem
  const $el = ui || this.$el;

  const { left, top } = $el.offset();
  const outerHeight = $el.outerHeight();
  const outerWidth = $el.outerWidth();

  return { left, top, outerHeight, outerWidth };
};

_.extend(View.prototype, {
  getBounds,
});

_.extend(CollectionView.prototype, {
  getBounds,
});

Backbone.Model.prototype.moment = function(attr) {
  const date = this.get(attr);

  // return '', null or undefined explicitly
  if (!date && date !== 0) {
    return date;
  }

  return moment(date);
};
