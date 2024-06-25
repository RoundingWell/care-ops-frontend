# Sass Guide

Most of our styles are linted for formating during the vite build and issues will show in the console when running `npm run lint` or in ci.

## JavaScript Selectors

A selector that is used only for JavaScript logic

`.js-*`

_Examples:_
* `.js-open`
* `.js-needs-attention`

```html
<button class="btn js-submit">Submit</button>
```

## State Selector

Shared by Sass and JavaScript and/or Handlebars. Should never be styled directly; only styled as an adjoining.

`.is-*`
`.has-*`

_Examples:_
* `.is-selected`
* `.has-error`

```sass
.btn {
  background-color: red;

  &.is-active {
    box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.25);
  }
}
```

## BEM Style Selector

Block, Element, Modifier. Used only in Sass. All modular and such. Favor multiple classes over @extends or it gets all wacky.

_Examples:_
* `.list`
* `.list__heading`
* `.list__heading--small`
* `.list__heading--large`
* `.list__heading--all-caps`


```html
<ul class="list">
  <li class="list__item">
    <h2 class="list__heading">Heading</h2>
    <h3 class="list__heading list__heading--small">Smaller Heading</h3>
    <p class="list__text">And a complete sentence.</p>
  </li>
  <li class="list__item"></li>
  <li class="list__item"></li>
</ul>
```

* http://csswizardry.com/2013/01/mindbemding-getting-your-head-round-bem-syntax/
* http://csswizardry.com/2015/03/more-transparent-ui-code-with-namespaces/
* https://medium.com/fed-or-dead/battling-bem-5-common-problems-and-how-to-avoid-them-5bbd23dee319#.o4u2vqr11

## Sass

Rule sets should be ordered as follows:

* @extend
* @include without @content
* properties
* @include with @content
* nested rule sets


```sass
.element {
  $scoped-variable: whatever;
  @extend .other-element;
  @include mixin($argument);
  property: value;

  @include breakpoint($size) {
    /* styles here */
  }

  &:pseudo {
    /* styles here */
  }

  .nested {
    /* styles here */
  }
}
```

## Comment Levels
```sass
// *************************************
//
//   First Level
//   -> Description
//
// *************************************

// -------------------------------------
//   Second Level
// -------------------------------------

// ----- Third Level ----- //

// Fourth Level
```

## Using @extend and @mixin
`@extend` should only be used in a single file. `@mixin` should be used when working across different partials.

* http://csswizardry.com/2014/11/when-to-use-extend-when-to-use-a-mixin/
* http://jedmao.ghost.io/2014/12/09/stop-using-sass-extend-to-reduce-bloat/
* https://tech.bellycard.com/blog/sass-mixins-vs-extends-the-data/

## Sass Compiling

Sass modules are imported via vite and compiled into css so the sass dependency order is decided by vite.

## Sass Organization

### `core/`

This directory includes generic classes that are used throughout the app.
This generally entails overrides, utility classes and generic layout helpers

All of the core sass are partials and imported in the `provider-core.scss`.

### `domain/`

Domain sass includes styles specific to the RoundingWell product that are used in multiple locations.
Most domain specific styles are defined in the sass modules in `../js/views` folders.
These are generally modules that are reused (or likely will be) by multiple js files in the app.

### `modules/`

Modules sass includes styles that are generic and could be used to create any application that are not specific to the business of RoundingWell.
These are generally modules that are reused (or likely will be) by multiple js files in the app.

### Sass in `../js/views`

Styles that are specific to a certain set of views are defined in scss files in the same folder as the `_views.js` file.
This allows us to easily understand when styles can be removed. No style in one of these files should be used outside of
the related js/hbs files. If a style should be reused it should move to `domain/` or `modules/` appropriately.

### `provider-variables.scss`

Because of the way vite compiles the sass, globally defined variables need to be defined in this file.
It contains mostly font size, padding, and color variables.

## Legacy Styles

Ideally when a group of styles is deprecated it is moved into a module named with `___-legacy.scss` in the filename.
These styles are open season for refactoring and should not be reused.

## Icon Fonts

We utilize https://fontawesome.com for icons

It is recommended that you [setup the fontawesome-pro registery globally](https://fontawesome.com/how-to-use/on-the-web/setup/using-package-managers#installing-pro).
You will need the RoundingWell FontAwesome token for this.
