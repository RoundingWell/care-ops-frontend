const _ = require('underscore');
const InjectPlugin = require('webpack-inject-plugin').default;

function faLoader({ fas, far, fal }) {
  const fasIcons = _.map(fas, fasIconName => {
    return `require('@fortawesome/pro-solid-svg-icons/${ fasIconName }').${ fasIconName }`;
  });

  const farIcons = _.map(far, farIconName => {
    return `require('@fortawesome/pro-regular-svg-icons/${ farIconName }').${ farIconName }`;
  });

  const falIcons = _.map(fal, falIconName => {
    return `require('@fortawesome/pro-light-svg-icons/${ falIconName }').${ falIconName }`;
  });

  return () => {
    return `const { library } = require(\'@fortawesome/fontawesome-svg-core\');
      library.add(
        ${ [...fasIcons, ...farIcons, ...falIcons].join(',') }
      );`;
  };
}

module.exports = class MyPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    new InjectPlugin(faLoader(this.options)).apply(compiler);
  }
};
