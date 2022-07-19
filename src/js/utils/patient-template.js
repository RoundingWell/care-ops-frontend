
import { each, first, propertyOf, reduce, escape } from 'underscore';

export const _ = { propertyOf, escape };

// {{ fields.field_name.deep_nest }}
const fieldRegEx = /{{\s*fields.([\w\-.]+?)\s*}}/g;
// {{ patient.first_name }}
const patientRegEx = /{{\s*patient.([\w\-.]+?)\s*}}/g;
// {{ value }}
const valueRegEx = /({{\s*value\s*}})/g;
// {{ value.deep.nest }}
const valueDeepRegEx = /{{\s*value(?:\.([\w\-.]+?))?\s*}}/g;
// {{ widget.widget_name-id }}
const widgetRegEx = /{{\s*widget.([\w\-.]+?)\s*}}/g;

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

function escapeTemplate(valueString) {
  return `'+\n((__t=(${ valueString }))==null?'':escape(__t))+\n'`;
}

function deepGetTemplate(dataKey, nestedKeys) {
  let keys = '';

  each(nestedKeys.split('.'), key => {
    keys += `'${ key }',`;
  });

  return escapeTemplate(`propertyOf(data.${ dataKey })([${ keys }])`);
}

export default function patientTemplate(text, childValue) {
  // Compile the template source, escaping string literals appropriately.
  let index = 0;
  let source = '';

  // Create a list of used field names for formatting only used fields
  const fieldNames = [];

  const widgetNames = [];

  const matcher = RegExp(`${ [
    fieldRegEx.source,
    patientRegEx.source,
    valueRegEx.source,
    valueDeepRegEx.source,
    widgetRegEx.source,
  ].join('|') }|$`, 'g');

  text.replace(matcher, function(match, fieldKeys, patientKeys, valueOnly, valueKeys, widgetName, offset) {
    source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
    index = offset + match.length;

    if (valueOnly) {
      source += escapeTemplate('data.value');
    }

    if (valueKeys) {
      source += deepGetTemplate('value', valueKeys);
    }

    if (fieldKeys) {
      fieldNames.push(first(fieldKeys.split('.')));
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

  const render = new Function('data', '{ propertyOf, escape }', source);

  const templateFunction = function(patient) {
    const patientFields = patient.getFields();

    const fields = reduce(fieldNames, (fieldData, name) => {
      const field = patientFields.find({ name });

      if (!field) return fieldData;

      fieldData[name] = field.get('value');

      return fieldData;
    }, {});

    const data = {
      patient: patient.attributes,
      fields,
      value: childValue,
    };

    return render.call(this, data, _);
  };

  templateFunction.widgetNames = widgetNames;

  return templateFunction;
}
