import _ from 'underscore';

// {{ fields.field_name.deep_nest }}
const fieldRegEx = /{{\s*fields.([\w-.]+?)\s*}}/g;
// {{ patient.first_name }}
const patientRegEx = /{{\s*patient.([\w-.]+?)\s*}}/g;
// {{ widget.widget_name-id }}
const widgetRegEx = /{{\s*widget.([\w-.]+?)\s*}}/g;

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
  return `\\${ escapes[match] }`;
}

function deepGetTemplate(dataKey, nestedKeys) {
  let keys = '';

  _.each(nestedKeys.split('.'), key => {
    keys += `'${ key }',`;
  });

  return `'+\n((__t=(_.propertyOf(data.${ dataKey })([${ keys }])))==null?'':_.escape(__t))+\n'`;
}

export default function patientTemplate(text) {
  // Compile the template source, escaping string literals appropriately.
  let index = 0;
  let source = '';

  // Create a list of used field names for formatting only used fields
  const fieldNames = [];

  const widgetNames = [];

  const matcher = RegExp(`${ [
    fieldRegEx.source,
    patientRegEx.source,
    widgetRegEx.source,
  ].join('|') }|$`, 'g');

  text.replace(matcher, function(match, fieldKeys, patientKeys, widgetName, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (fieldKeys) {
      fieldNames.push(_.first(fieldKeys.split('.')));
      source += deepGetTemplate('fields', fieldKeys);
    }

    if (patientKeys) {
      source += deepGetTemplate('patient', patientKeys);
    }

    if (widgetName) {
      widgetNames.push(widgetName);
      source += `<span data-${ widgetName }-region></span>`;
    }

    return match;
  });

  source = `var __t;\nreturn '${ source }';\n`;

  const render = new Function('data', '_', source);

  const templateFunction = function(patient) {
    const patientFields = patient.getFields();

    const fields = _.reduce(fieldNames, (fieldData, name) => {
      const field = patientFields.find({ name });

      if (!field) return fieldData;

      fieldData[name] = field.get('value');

      return fieldData;
    }, {});

    const data = {
      patient: patient.attributes,
      fields,
    };

    return render.call(this, data, _);
  };

  templateFunction.widgetNames = widgetNames;

  return templateFunction;
}
