# Widgets

## Defined Widgets

All available widget types are currently located in the [widgets file](https://github.com/RoundingWell/care-ops-frontend/blob/develop/src/js/views/patients/widgets/widgets.js)

Most are hardcoded such as `dob` which formats and displays the patient's Date of Birth

## DEPRECATIONS

All Custom Widgets have been deprecated

Widget definition `field_name` has been deprecated for `key`.

The following examples are equivalent:
```json
{
  "display_name": "Example Widget",
  "key": "foo",
}
```

Deprecated:
```json
{
  "display_name": "Example Widget",
  "field_name": "foo"
}
```

The follow nested examples are equivalent:
```json
{
  "display_name": "Example Widget",
  "key": "foo.nested.value"
}
```

Deprecated:
```json
{
  "display_name": "Example Widget",
  "field_name": "foo",
  "key": "nested.value"
}
```

Widget type `groups` has been deprecated for `workspaces`.

The following widget with a `category: "workspaces"`:

```json
  {
    "category": "workspaces",
    "slug": "workspaces",
    "definition": {
      "display_name": "Display Name"
    }
  }
```


Is equivalent to this widget with the deprecated `category: "groups"`:

```json
  {
    "category": "groups",
    "slug": "groups",
    "definition": {
      "display_name": "Display Name"
    }
  }
```

## Main Widget

The main widget supports the optional `display_name` and a handlebars `template`.  Frontend handlebars helpers are available.

The `values` of the widget inform the backend as to what data to provide to the widget. Reference backend documentation for current options.

```json
{
  "id": "<uuid>",
  "type": "widgets",
  "attributes": {
    "category": "widget",
    "slug": "template",
    "name": "Name for Organization",
    "definition": {
      "template": "<hr><div>{{far 'calendar-days'}}Sex: <b>{{ sex }}</b></div><hr>",
      "display_name": "Optional Label"
    },
    "values": {
      "sex": "@patient.sex"
    }
  }
}
```


## Hardcoded Widgets

* dob
* sex
* status
* divider
* workspaces

### Form Widget

For displaying a standalone form in a widget area. Example:
```json
{
  "category": "formWidget",
  "definition": {
    "display_name": "Form",
    "form_id": "1",
    "form_name": "Test Form",
    "is_modal": true,
    "modal_size": "small"
  }
}
```

`is_modal` will display the form in a modal instead of the form page.
`modal_size` can be `small` or `large` to override the default size

## Custom Widgets (DEPRECATED)

Custom widgets all support `default_html`. If supplied the `default_html` will display when the selected field is null/empty, allowing for a custom message (such as `<i>No Phone Number Available</i>`)

### optionsWidget

This widget handles displaying a value from a defined set of options.

Example:

This widget definition:
```json
{
  "display_name": "Risk Level",
  "key": "toc_inpatient.assessment.risk_level",
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
  "template": "{{ fields.field-name.deeply.nested.key }} {{ patient.patient_attribute }} {{ widget.slug }}"
}
```

Supporting empty values.  There is one class currently available to widgets `widget-value`.  This class will display the greyed dash if the container is empty.  For instance:

```hbs
<p>Always has: {{ fields.this-value }}</p>
<p>Sometimes has: <span class="widget-value">{{ fields.optional-value }}</span></p>
```

**NOTE** The entire `templateWidget` is wrapped in this class so a simple `template: "{{ fields.optional-value }}"` will support this without adding the span.

### fieldWidget

For displaying simple form information that doesn't require any special formating. Supports `default_html`.

```json
{
  "display_name": "Field Widget - Phone Field",
  "key": "phone.mobile"
}
```

would look for the phone field:
```json
{
  "name": "phone",
  "value": {
    "mobile": "6155555551"
  }
}
```

and display the `mobile` key in `value` as a string w/o any formatting.

### phoneWidget

For displaying a **formatted** phone number. Currently only supports formatting US phone numbers. Supports `default_html`

example definition w/`default_html`:
```json
{
  "display_name": "Patient Phone",
  "default_html": "No Phone Available",
  "key": "phone_number.phone.number.is.here"
}
```

for this phone field
```json
{
  "name": "phone_number",
  "value": {
    "phone": {
      "number": {
        "is": {
          "here": "6155555555"
        }
      }
    }
  }
}
```

would display "(615) 555-5555". If the phone number is incomplete, but parseable, an unformatted version will be displayed (i.e. "615555555"). If the phone number is not parseable, either because it is empty or not a phone number, nothing will be displayed. If no value is found at the supplied `key`, the fallback `default_html` will be displayed.


### dateTimeWidget

For displaying a formatted date and/or time. Supports a `format` attribute that takes [dayjs-supported formats](https://day.js.org/docs/en/display/format). Default formatting is dependent on whether the date value has a timestamp and how it relates to the current date:

* Value of `2021-01-01T15:31:48Z` and is current day: `9:31 AM` (Central Time)
* Value of `2021-01-01T15:31:48Z` and is current year: `Jan 1`
* Value of `2020-01-01T15:31:48Z` and is not current year: `Jan 1, 2020`

An optional `inputFormat` attribute is also available to specify the format of the value passed to the widget also supporting [dayjs-supported formats](https://day.js.org/docs/en/display/format.

#### dateTimeWidget with default formatting
Example definition:
```json
{
  "display_name": "Last Patient Visit",
  "default_html": "No Date Available",
  "key": "patient_visit.today.date"
}
```

Example date field:
```json
{
  "name": "patient_visit",
  "value": {
    "today": {
      "date": "2021-01-01T15:31:48Z",
    }
  }
}
```

#### dateTimeWidget with custom formatting
Example definition:
```json
{
  "display_name": "Last Patient Visit",
  "default_html": "No Date Available",
  "key": "patient_visit",
  "format": "lll"
}
```

Example date field:
```json
{
  "name": "patient_visit",
  "value": "2021-01-01T15:31:48Z"
}
```

Displays as:
`Jan 1, 2021 9:31 AM`

### arrayWidget

For displaying child widgets for an array value with a patient field.

Example definition:
```json
{
  "display_name": "Simple Array",
  "default_html": "No Values in Array",
  "key": "patient_array"
}
```

Example array field:
```json
{
  "name": "patient_array",
  "value": [
    "1",
    "two",
    "foo"
  ]
}
```

Displays as:
```
1
two
foo
```

#### arrayWidget with a custom child widget

Example definitions:
```json
{
  "display_name": "Simple Array",
  "key": "patient_array",
  "child_widget": "myWidgetSlug"
}
```
```json
{
  "display_name": "Simple Array",
  "key": "patient_array",
  "child_widget": {
    "category": "templateWidget",
    "definition": {
      "template": "<p>{{ value }}</p>"
    }
  }
}
```

#### arrayWidget with a custom child widget and complex data

For field data:
```json
[
  {
    "deep": {
      "nested": "foo"
    },
    "date": "1990-01-01T00:00:00-05:00"
  },
  {
    "deep": {
      "nested": "bar"
    },
    "date": "1980-01-01T00:00:00-02:00"
  }
]
```

```json
{
  "display_name": "Array of Objects",
  "key": "patient_array",
  "child_widget": {
    "category": "templateWidget",
    "definition": {
      "template": "<p>{{ value.deep.nested }} - {{ widget.patientArrayDate }}</p>"
    }
  }
}
```
with widget:
```json
{
  "slug": "patientArrayDate",
  "category": "dateTimeWidget",
  "definition": {
    "format": "MMM",
    "key": "date"
  }
}
```

#### arrayWidget with filter_value

Uses [underscore's filter](http://underscorejs.org/#filter) to mutate array values


For field data:
```json
[
  {
    "type": "foo",
    "label": "Foo"
  },
  {
    "type": "bar",
    "label": "Bar"
  }
]
```

```json
{
  "display_name": "Array of Objects",
  "key": "patient_array",
  "filter_value": { "type": "foo" },
  "child_widget": {
    "category": "templateWidget",
    "definition": {
      "template": "<p>{{ value.label }}</p>"
    }
  }
}
```
Will display:
```
<p>Foo</p>
```

#### arrayWidget with reject_value

Uses [underscore's reject](http://underscorejs.org/#reject) to mutate array values


For field data:
```json
[
  {
    "type": "foo",
    "label": "Foo"
  },
  {
    "type": "bar",
    "label": "Bar"
  }
]
```

```json
{
  "display_name": "Array of Objects",
  "key": "patient_array",
  "reject_value": { "type": "foo" },
  "child_widget": {
    "category": "templateWidget",
    "definition": {
      "template": "<p>{{ value.label }}</p>"
    }
  }
}
```
Will display:
```
<p>Bar</p>
```

### Patient Identifier Widget

This widget displays a patient identifier value (such as a MRN or SSN number).

As an example, this is how you'd display a patient's MRN number:

```json
{
  "category": "patientIdentifiers",
  "definition": {
    "default_html": "Not Found",
    "display_name": "MRN Number",
    "identifier_type": "mrn"
  }
}
```

This would display:

```
MRN Number
A5432112345
```

If the patient identifier is null/empty, the `default_html` value will display instead. Using the example above, it would display `Not found`.

```
MRN Number
Not Found
```

If the patient identifier is null/empty and no `default_html` value is supplied, a dash (`-`) will be shown.

```
MRN Number
-
```
