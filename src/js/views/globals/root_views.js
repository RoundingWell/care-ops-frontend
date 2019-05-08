import _ from 'underscore';
import Radio from 'backbone.radio';
import { View, CollectionView, Region } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import 'sass/modules/fill-window.scss';

import TopRegionBehavior from 'js/behaviors/top-region';

const userActivityCh = Radio.channel('user-activity');
const historyCh = Radio.channel('history');

const AppView = View.extend({
  className: 'app-frame',
  template: hbs`App goes here`,
});

const TopRegionView = View.extend({
  behaviors: [TopRegionBehavior],
  regionClass: Region.extend({ replaceElement: true }),
  template: hbs`<div data-region></div>`,
  regions: {
    region: '[data-region]',
  },
  contains(target) {
    const region = this.getRegion('region');
    if (region.hasView() && this.Dom.hasEl(region.currentView.el, target)) return true;
  },
});

const ModalRegionView = TopRegionView.extend({
  behaviors: [{
    behaviorClass: TopRegionBehavior,
    className: 'fill-window--dark',
  }],
  initialize({ $body }) {
    this.region = this.getRegion('region');
    this.$body = $body;
  },
  onRegionShow() {
    this.listenTo(userActivityCh, 'window:resize', this.setLocation);
    this.setLocation();
  },
  onRegionEmpty() {
    this.stopListening(userActivityCh);
  },
  setLocation() {
    const view = this.region.currentView;
    const width = view.$el.outerWidth();
    const height = view.$el.outerHeight();
    const bodyHeight = this.$body.height();
    const bodyWidth = this.$body.width();

    const left = bodyWidth / 2 - width / 2;
    const top = bodyHeight / 3 - height / 3;

    view.$el.css({
      left: _.px(left),
      top: _.px(top),
    });
  },
  contains(target, testView) {
    if (!this.region.hasView()) return false;
    // testView prevents closing layers below
    if (this.Dom.hasEl(this.region.currentView.el, target) || this !== testView) return true;
  },
});

const popDefaults = {
  align: 'left',
  direction: 'down',
  heightOffset: 0,
  left: 0,
  popWidth: null,
  top: 0,
  widthOffset: 0,
  windowPadding: 5,
};

const PopRegionView = TopRegionView.extend({
  initialize({ $body }) {
    this.region = this.getRegion('region');
    this.$body = $body;
  },
  onRegionShow(region, view, options) {
    const popOptions = _.extend({}, popDefaults, options);
    this.listenTo(userActivityCh, 'window:resize', this.empty);
    this.listenTo(historyCh, 'change:route', this.empty);
    this.listenTo(this.currentView, 'render render:children', _.partial(this.setLocation, popOptions));
    this.setLocation(popOptions);
  },
  onRegionEmpty() {
    this.stopListening(userActivityCh);
    this.stopListening(historyCh);
    this.stopListening(this.currentView);
  },
  contains(target) {
    const region = this.getRegion('region');
    if (region.hasView() && this.Dom.hasEl(region.currentView.el, target)) return true;
    if (this.ignoreEl && this.Dom.hasEl(this.ignoreEl, target)) return true;
  },
  setLocation(popOptions) {
    const view = this.region.currentView;
    const height = view.$el.outerHeight();
    const top = this.setDirection(height, popOptions);
    const width = popOptions.popWidth || view.$el.outerWidth();
    const left = this.setAlign(width, popOptions);

    const css = {
      top: _.px(top),
      left: _.px(left),
    };

    if (popOptions.popWidth) css.width = _.px(width);

    view.$el.css(css);
  },
  setAlign(width, { left, align, windowPadding, widthOffset }) {
    if (align === 'right') left += widthOffset - width;
    if (left < windowPadding) return windowPadding;

    const bodyWidth = this.$body.width();
    if (left + width > bodyWidth - windowPadding) {
      return bodyWidth - width - windowPadding;
    }
    return left;
  },
  setDirection(height, { top, direction, windowPadding, heightOffset }) {
    const bodyHeight = this.$body.height();

    if (direction === 'down') {
      if (top + height + windowPadding > bodyHeight) {
        direction = 'forceUp';
        return this.setDirection(height, { top, direction, windowPadding, heightOffset });
      }

      return heightOffset + top;
    }

    top -= heightOffset + height;
    if (top >= windowPadding) return top;

    if (direction === 'forceUp') {
      return bodyHeight - windowPadding - height;
    }

    direction = 'down';
    return this.setDirection(height, { top, direction, windowPadding, heightOffset });
  },
});

const RootView = CollectionView.extend({
  viewComparator: false,
  el: 'body',
  initialize() {
    this.regions = [];
    const $body = this.$el;

    Radio.reply('top-region', 'contains', this.contains, this);

    // Add lowest layer (z-index) to highest
    this.addRegionView('appFrame', new AppView());
    this.addRegionView('alert', new TopRegionView());
    this.addRegionView('modal', new ModalRegionView({ $body }));
    this.addRegionView('modalSmall', new ModalRegionView({ $body }));
    this.addRegionView('pop', new PopRegionView({ $body }));
    this.addRegionView('error', new TopRegionView());
  },
  addRegionView(name, view) {
    view.name = name;
    this.addChildView(view);
    this.regions[name] = view.getRegion('region');
  },
  getRegion(name) {
    return this.regions[name];
  },
  contains(testView, target) {
    const viewIndex = this.children.findIndexByView(testView);

    // Tests to see if a click is registered on a higher layer
    for (let i = this.children.length - 1; viewIndex <= i; i--) {
      const view = this.children.findByIndex(i);
      if (view.contains(target, testView)) return true;
    }
  },
});

export {
  RootView,
};
