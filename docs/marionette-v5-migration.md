# Marionette 5 migration log

## Target and baseline

- Target: `marionette@5.0.0-beta.2`; published source revision
  `13f4954c352e646c413091ffdd83f6da59404573`.
- Pre-install package inspection completed before target dependency installation.
- Baseline: `npm ci` passed; 49 component specs and 248 tests passed; 35 E2E
  specs passed unchanged. ESLint and Stylelint passed; the local editor-config
  check could not find its downloaded macOS ARM binary.

## Current state

- Migration base: `feature/marionette-v5` at
  `d2ba54b4fcb579e626b704ba532fbb540ccdf1e2`.
- Active step: replace the unmaintained `backbone.eventrouter` dependency with a
  local Backbone.Router adapter that receives the application's Radio channel.
- The final routing target was changed by human direction: retain Backbone.Router
  rather than migrate to the browser Navigation API.
- Next after human merge: install the exact Marionette beta, configure Backbone
  data and Morphdom rendering, and change all Radio imports atomically.

## Validation

- Targeted RouterApp component spec: 12 tests passed.
- Full component suite: 49 specs and 248 tests passed.
- Full E2E suite: 35 specs and 308 tests passed unchanged.
- ESLint passed; full lint status retains the baseline editor-config binary issue.

## Friction and corrected failures

- Closed PR #1770 copied toolkit lifecycle behavior locally. That recreated
  Marionette 4 patterns and was abandoned before merge.
- A native Navigation API implementation was completed locally, then stashed as
  `native Navigation API routing experiment` when the routing target changed.
- The first local EventRouter constructor used object-method syntax. Backbone's
  `extend` adopts that value as the subclass constructor, but native object
  methods are not constructable. Changing it to a function-valued constructor
  restored the established Backbone extension contract.
