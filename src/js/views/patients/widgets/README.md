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
