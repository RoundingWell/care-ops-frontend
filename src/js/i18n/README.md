# Internationalization and Localization

## Twig

Currently for patient app and provider pre-login we're using the twig helper `i18n()`
to wrap strings to be translated. We are also utilizing momentjs and libphonenumber-js
on the patient app from an older style jquery setup where the libs are loaded in
`<script>` tags in the html.

This is currently using the `String has a :variable` format, but will at some point switch
to ICU Message format `String has a { variable }` when supported.

## formatjs

For the provider app we are using Yahoo's [formatjs](https://formatjs.io/) through the
[handlebars-intl](https://formatjs.io/handlebars/) lib. Our translation will be key based
and found in the directory [`/assets/js/i18n`](https://github.com/RoundingWell/RWell/tree/d3a745250aab37b16cb4c1f1e9afb18ff45be5a6/mainapp/assets/js/i18n).

The key naming strategy currently under consideration is:
`view.directory.fileViews.viewName.stringContextName` where the first part is the
the directory of the view file or template delimited by "." followed by a camelCased version
of the file in that directory; followed by a camelCased version of the ViewClass (if for a view);
followed by the camelCased string contextual name. We should attempt to describe what the string
is _doing_ in context, not what the text necessarily _says_. IE perhaps the text string we are
replacing is "Save". Rather than name the context name it could be saveLabel (or just label
if the View name is particularly descriptive.) This way the key is not ambiguous as far as,
"Is it for the button or the label?" etc.

Considering the following hypothetical locale example:
```json
{
  "locales": "en-US",
  "globals": {
    "headerViews": {
      "titleView": {
        "welcomeText": "Welcome to our site!"
      }
    }
  }
}
```

There are 3 methods for accessing i18n strings. Primarily we will want to access strings via handlebars.
If not using a specific formatjs helper (for pluralization for instance) intl information can be accessed
via handlebars "@data" interface such that:
```hbs
<h1>{{ @intl.globals.headerViews.titleView.welcomeText }} | {{ today }}</h1>
```

Handlebars templates rendered via a Marionette.View will automatically render with intl data.
For scenarios in which case we want to render a handlebars template inline we will need another renderer:
```js
import { renderTemplate } from 'js/i18n';

const SomeTemplate = hbs`<h1>{{ @intl.globals.headerViews.titleView.welcomeText }} | {{ today }}</h1>`;

const someHtmlString = renderTemplate(SomeTemplate, { today: moment().format('l') });

// someHtmlString will be "<h1>Welcome to our site! | January 1, 2020</h1>"
```

Additionally there will be some instances where we want a localized string in js directly:
```js
import intl from 'js/i18n';

const myModel = new Backbone.Model({
    title: intl.globals.headerView.titleView.welcomeText
});

myModel.get('title'); // "Welcome to our site!"
```

One additional note: When using a key with a formatjs interface `intl` would not be included.
```hbs
<span class="inbox_count">{{formatMessage (intlGet "globals.someView.inboxCount")
                            count = inbox_count }}</span>
```

Strings that contain html will be postfixed with `HTML` on the key name. The key will then need to be referenced in the template with either `{{{ }}}` or `{{formatHTMLMessage}}`. For example:
```json
{
  "locales": "en-US",
  "globals": {
    "headerViews": {
      "titleView": {
        "welcomeTextHTML": "<strong>Welcome to our site!<strong> Enjoy your stay."
      }
    },
    "footerViews": {
        "signatureView": {
            "goodbyeTextHTML": "<strong>Goodbye,</strong> { username }"
        }
    }
  }
}
```
```hbs
{{{ @intl.globals.headerView.titleView.welcomeTextHTML }}}
{{formatHTMLMessage (intlGet "globals.footerViews.signatureView.goodbyeTextHTML") username=user_name }}
```

Also note that for now we'll be using momentjs and not formatjs for date and time formatting.

Currently we are including all supported locales in the same bundle. Locales are whitelisted with
the [`ContextReplacementPlugin`](https://github.com/RoundingWell/RWell/blob/d3a745250aab37b16cb4c1f1e9afb18ff45be5a6/mainapp/gulp-tasks/config/webpack.config.js#L141).
Locales are nested within language files by [`handlebars-intl`](https://github.com/yahoo/handlebars-intl/tree/master/dist/locale-data).

**If a new locale is added, its language will need to be added to the whitelist.**

## intl.js

`intl` is a polyfill for supporting the `window.Intl` API. Needed for IE 9 + 10 as well as
Safari < 10. Additionally older (mostly unsupported) Android related browsers also need it.
We're currently loading this polyfill for all users and load each of the locales `en-US`,
`en-IN`, and `pt-BR` as well. At some point it would be best to load only the locale of the user,
and only load the entire polyfill for users that need it.

**If a new locale is added, a new intl.js locale jsonp must be added**
https://github.com/andyearnshaw/Intl.js/tree/master/locale-data/jsonp
https://github.com/RoundingWell/RWell/tree/develop/shared/assets/js/intl-locale

## moment.js

moment on the provider app is loaded via webpack. Currently we are including all supported locales
in the same bundle. Locales are whitelisted with the [`ContextReplacementPlugin`](https://github.com/RoundingWell/RWell/blob/d3a745250aab37b16cb4c1f1e9afb18ff45be5a6/mainapp/gulp-tasks/config/webpack.config.js#L138).
moment by default includes `en-US`.

**If a new locale is added, it will need to be added to the whitelist.**

Additionally we'll be switching to using `format('l')` style localized moment formats whenever possible.
See "Multiple Locale Support" at [momentjs.com](http://momentjs.com/)

_We are not currently localizing moment content on providerapp_

## libphonenumber-js

This is a minimal API version of google's libphonenumber library in javascript. We maintain our own copy
on RoundingWellOS - [libphonenumber-js](https://github.com/RoundingWellOS/libphonenumber-js).

The backend uses https://github.com/giggsey/libphonenumber-for-php and is currently locked on v8.5.0

We are currently building this lib with extended metadata for the countries (note: not locales) that we support.

**If a new country is added we need to update this [libraries build script](https://github.com/RoundingWellOS/libphonenumber-js/blob/master/package.json#L32)**

We need to update the `libphonenumber-for-php` in tandem with `libphonenumber-js` to make sure the rules are
the same on the frontend and backend.

To update this library run `npm run rwell-build` and check in the results. Update `package.json` version
and publish to npm. Then update the provider dependency and the lib in shared assets.

## [PhraseApp](https://phraseapp.com)
When uploading a new version of en-US.yml to PhraseApp:
1. Select "Symfony YAML (.yml)" as the format (*not the beta version)
2. Select "Use existing local" and "en-US"

Any time strings are changed or added to the YAML file, it must be uploaded to PhraseApp. **Important:** Whenever the file is uploaded to PhraseApp, the branch containing the changes must also be deployed to translate.roundingwell.com.

When existing strings have been modified, you'll need to tell PhraseApp to update all existing translations by checking "Update translations" when uploading the YAML file.

Once the YAML file has been uploaded, PhraseApp should display that the English locale has 0 untranslated keys. If it says there are untranslated keys, review the YAML changes to ensure nothing is incorrect. It will also display any keys that have been removed. Delete those unused keys.

Strings with complex logic such as the use of `select`s or nested logic may require extra clarification in the comments for that individual string. Go to Locales > en-US, and search for the string. Click the Comments tab to add further explanation.
