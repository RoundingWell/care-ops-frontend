import { Component } from 'marionette.toolkit';

export default Component.extend({
  // https://github.com/RoundingWellOS/marionette.toolkit/issues/241
  showIn(region, viewOptions, regionOptions) {
    this._region = region;

    this.show(viewOptions, regionOptions);

    return this;
  },
});
