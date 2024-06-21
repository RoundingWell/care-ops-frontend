// TODO: Export this to a vite plugin
import Handlebars from 'handlebars';
import fs from 'fs';

const VITE_PLUGIN_NAME = 'vite-plugin-handlebars-loader';
const fileRegex = /\.hbs$/;

export default function viteHbsPlugin(hbsOptions = {}) {
  return {
    name: VITE_PLUGIN_NAME,
    enforce: 'pre',

    async load(id) {
      if (fileRegex.test(id)) {
        let hbsCode;
        try {
          hbsCode = await fs.promises.readFile(id, 'utf8');
        } catch (exception) {
          console.warn(`${ id } couldn't be loaded by ${ VITE_PLUGIN_NAME }: `, exception);
          return;
        }
        try {
          const compiledHbs = Handlebars.precompile(hbsCode, hbsOptions);
          return `
            import HandlebarsRuntime from 'handlebars/runtime';
            export default HandlebarsRuntime.template(${ compiledHbs.toString() });
          `;
        } catch (exception) {
          console.error(`${ id } errored during Handlebars compiling: `, exception);
        }
      }
    },
  };
}
