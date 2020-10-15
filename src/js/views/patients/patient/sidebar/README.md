# Sidebar Widgets

## Defined Widgets

All available widget types are currently located in the [sidebar_views file](https://github.com/RoundingWell/care-ops-frontend/blob/develop/src/js/views/patients/patient/sidebar/sidebar_views.js#L24)

Most are hardcoded such as `dob` which formats and displays the patient's Date of Birth

## Custom Widgets

There are currently 2 custom widget types

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
