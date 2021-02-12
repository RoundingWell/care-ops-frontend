# Sidebar Widgets

## Defined Widgets

All available widget types are currently located in the [sidebar_views file](https://github.com/RoundingWell/care-ops-frontend/blob/develop/src/js/views/patients/patient/sidebar/sidebar_views.js#L40)

Most are hardcoded such as `dob` which formats and displays the patient's Date of Birth

## Hardcoded Widgets

* dob
* sex
* status
* divider
* groups
* engagement

## Custom Widgets

There are currently 5 custom widget types.

`optionsWidget`, `phoneWidget`, and `fieldWidget` all support `default_html`. If supplied the `default_html` will display when the selected field is null/empty, allowing for a custom message (such as `<i>No Phone Number Available</i>`)

### optionsWidget

This widget handles displaying a value from a defined set of options.

Example:

This widget definition:
```json
{
  "display_name": "Risk Level",
  "field_name": "toc_inpatient",
  "key": "assessment.risk_level",
  "display_options": {
    "high": "High",
    "medium": "tis Medium",
    "low": "can't get lower"
  }
}
```

Will take the patient field:
```json
{
  "name": "toc_inpatient",
  "value": {
    "assessment": {
      "risk_level": "medium"
    }
  }
}
```

And display
```
Risk Level:
tis Medium
```

### templateWidget

This widget supports a very customized simple template for displaying various patient and patient field data.

The template currently has 3 options represented in the following example:

```json
{
  "display_name": "Example Template",
  "template": "{{ fields.field-name.deeply.nested.key }} {{ patient.patient_attribute }} {{ widget.widgetNameId }}"
}
```

Supporting empty values.  There is one class currently available to widgets `widget-value`.  This class will display the greyed dash if the container is empty.  For instance:

```js
{
  template: `
    <p>Always has: {{ fields.this-value }}</p>
    <p>Sometimes has: <span class="widget-value">{{ fields.optional-value }}</span></p>
  `
}
```

**NOTE** The entire `templateWidget` is wrapped in this class so a simple `template: "{{ fields.optional-value }}"` will support this without adding the span.

### formWidget

For displaying a standalone form in the sidebar. Example definition:
```js
{
  display_name: 'Form',
  form_id: '1',
  form_name: 'Test Form',
}
```

### fieldWidget

For displaying simple form information that doesn't require any special formating. Supports `default_html`.

```js
{
  display_name: 'Field Widget - Phone Field',
  field_name: 'phone',
  key: 'mobile',
}
```

would look for the phone field:
```js
{
  name: 'phone',
  value: {
    mobile: '6155555551',
  },
}
```

and display the `mobile` key in `value` as a string w/o any formatting.

### phoneWidget

For displaying a **formatted** phone number. Currently only supports formatting US phone numbers. Supports `default_html`

example definition w/`default_html`:
```js
{
  display_name: 'Patient Phone',
  default_html: 'No Phone Available',
  field_name: 'phone_number',
  key: 'phone.number.is.here',
}
```

for this phone field
```js
{
  name: 'phone_number',
  value: {
    phone: {
      number: {
        is: {
          here: '6155555555',
        },
      },
    },
  },
}
```

would display "(615) 555-5555". If the phone number is incomplete, but parseable, an unformatted version will be displayed (i.e. "615555555"). If the phone number is not parseable, either because it is empty or not a phone number, nothing will be displayed. If no value is found at the supplied `key`, the fallback `default_html` will be displayed.
