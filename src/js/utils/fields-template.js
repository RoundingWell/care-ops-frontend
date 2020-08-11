import _ from 'underscore';

// {{ fields.field_name.deep_nest }}
const fieldRegEx = /{{\s*fields.([a-zA-Z0-9.]+?)\s*}}/g;

// Certain characters need to be escaped so that they can be put into a
// string literal.
const escapes = {
  '\'': '\'',
  '\\': '\\',
  '\r': 'r',
  '\n': 'n',
  '\u2028': 'u2028',
  '\u2029': 'u2029',
};

const escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

function escapeChar(match) {
  return `\\ ${ escapes[match] }`;
}

export default function fieldsTemplate(text) {
  // Compile the template source, escaping string literals appropriately.
  let index = 0;
  let source = '';
  const fieldNames = [];

  text.replace(fieldRegEx, function(match, fieldKeys, offset) {
    fieldNames.push(_.first(fieldKeys.split('.')));
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;
    source += `'+\n((__t=(${ fieldKeys }))==null?'':_.escape(__t))+\n'${ text.slice(index) }`;
    return match;
  });

  source = `var __t,__p='';with(fieldsData||{}){\n__p+='${ source }';\n}\nreturn __p;\n`;

  let render;

  try {
    render = new Function('fieldsData', '_', source);
  } catch (e) {
    e.source = source;
    throw e;
  }

  const template = function(data) {
    return render.call(this, data, _);
  };

  // export fieldNames for data gathering
  template.fieldNames = fieldNames;

  return template;
}
