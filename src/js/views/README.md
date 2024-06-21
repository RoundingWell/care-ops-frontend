# Views

This directory houses the Marionette views, related Sass and Handlebar template files for the application. This directory structure should roughly mirror `mainapp/assets/apps`. All JavaScript files should follow the `view-name_views.js` convention and all template files should have the extension `.hbs`.

## Security

[Preventing Injection](https://github.com/RoundingWell/RWell/wiki/Security#htmlstylejavascript-injection)

We treat all data coming down the API as hostile.  By default this is ok as both handlebars and our underscore templates are setup to handle escaping by default via: `{{ }}`

However in the cases where you _must_ have HTML in the data using `{{{ }}}`, we need to ensure that any data coming from the API is `_.escape`'d before display otherwise we're opening the door to XSS.

Along these lines, whenever possible, move HTML data or character codes into the template instead of inside of a `Marionette` `templateHelper`. If you are designing an interface that allows HTML input (such as the tooltip) make sure it is clear that the data being displayed is html in the variable name, so that a user down the line does not have to remember if the component acts securely by default.

## Sass

Sass files are imported into any js file that uses a class or that imports a template that uses a class
so that the sass dependency tree is built. Any `SASS/modules` are imported at the top after the third party
imports but prior to any other internal code, `SASS/domain` should be imported after all components, views and templates,
and finally any local sass file that is paired with the view file should be imported last.

## Handlebars Templates

Handlebars templates are stored in the same folders as the views file that imports them.
Vite precompiles them into the built javascript.

## Inline Handlebars Templates

To keep some views simpler and easier to read some templates may be better written inline.
Any functionality available to the handlebars templates are available to the inline templates.
To do so with handlebars use the following format:

```javascript
import hbs from 'handlebars-inline-precompile';

const MyView = Marionette.View.extend({
    template: hbs`Show some {{ data }}`
});
```

**Note** that template literal variables (ie: `${ var }` cannot be used within the `hbs` literal tag.

## Template Logic

Try not to use if/else statements for large chucks of code, instead breakdown templates into the smallest chucks if possible.

### Template Styleguide

- variable spacing `{{ something }}`
- if/else no spacing `{{#if something}} {{else}} {{/if}}`

Spacing matters when using logic, like if/else statements, in templates.

Incorrect way:

```handlebars
{{#if something}}
<div><span></span></div>
{{/if}}
```

Correct way:

```handlebars
{{#if something}}
    <div><span></span></div>
{{/if}}
```

Ideally tags are complete within template logic:

## HTML Element Attributes

HTML element attribute values should be wrapped in `""`.

For example:

```html
<div class="myClass"></div>
```

### Attribute Ordering:

HTML attributes should come in this particular order for easier reading of code.

* class
* id, name
* src, for, type, href, value
* title, alt
* role, aria-*
* boolean values

Resources:

- [Code Guide by Mark Otto](http://codeguide.co/)
