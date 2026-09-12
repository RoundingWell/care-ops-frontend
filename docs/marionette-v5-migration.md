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
  `6b49ca1f35245c18ba40d172ca3ff836a2cc0ab2`.
- Completed: PR #1771 replaced `backbone.eventrouter` with a local
  Backbone.Router adapter and was merged by a human.
- Active step: pass explicit Marionette View instances to Regions instead of
  relying on Marionette 4's implicit string and options conversion.
- The final routing target was changed by human direction: retain Backbone.Router
  rather than migrate to the browser Navigation API.
- Intermediate PRs keep GitHub Cypress deferred; the unchanged Cypress contract
  runs locally before publication.
- Next after human merge: replace Toolkit Components with Marionette Views in
  bounded groups without adding a compatibility Component.

## Active-step validation

- Targeted sidebar and date-filter E2E: 4 specs and 26 tests passed.
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
