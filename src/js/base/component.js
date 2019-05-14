import { Component } from 'marionette.toolkit';

export default Component.extend({
  show() {
    Component.prototype.show.apply(this, arguments);

    const region = this.getRegion();

    // https://github.com/RoundingWellOS/marionette.toolkit/issues/235
    this.stopListening(region, 'empty', this._destroy);
    this.listenTo(this.currentView, 'destroy', this._destroy);
    this.listenTo(region, 'empty', () => {
      this._isShown = false;
    });

    return this;
  },
  empty() {
    // https://github.com/RoundingWellOS/marionette.toolkit/issues/236
    this._shouldDestroy = false;

    this.region.empty();

    this._shouldDestroy = true;
  },
  isShown() {
    return this._isShown;
  },
}, {
  setRegion(region) {
    this.prototype.region = region;
  },
});
