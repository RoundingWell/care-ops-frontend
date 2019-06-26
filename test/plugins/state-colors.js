const _ = require('underscore');

module.exports = env => {
  const hexToRgb = function(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return `rgb(${ parseInt(result[1], 16) }, ${ parseInt(result[2], 16) }, ${ parseInt(result[3], 16) })`;
  };

  env.stateColors = _.mapObject(env.stateColors, sassVar => hexToRgb(sassVar));

  return env;
};
