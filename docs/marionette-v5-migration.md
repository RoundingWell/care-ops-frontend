# Marionette 5 migration log

## Target and sequence

- Target: `marionette@5.0.0-beta.2`; published source revision `13f4954c352e646c413091ffdd83f6da59404573`.
- Step 1: remove the Marionette 4-only `marionette.toolkit` dependency while retaining the app's existing lifecycle, child-app, component, and Backbone state behavior.
- Step 2: replace Backbone/EventRouter history routing with the Navigation API, including redirects, deep links, query/hash handling, and app lifetimes; remove the old router packages and set the required Browserslist.
- Step 3: switch atomically to Marionette 5, its Backbone and Morphdom adapters, Marionette Radio, and the required view integration updates.

## Baseline

- `npm ci`: passed.
- `npm run coverage:component`: 49 specs, 248 tests passed.
- `npm run coverage:e2e`: 35 specs passed unchanged.
- `npm run lint`: ESLint and Stylelint passed; the pre-existing editor-config check could not find its downloaded macOS ARM binary.

## Current step

- Branch: `feature/marionette-v5-remove-toolkit` from `feature/marionette-v5` at `d2ba54b4fcb579e626b704ba532fbb540ccdf1e2`.
- PR: [#1770](https://github.com/RoundingWell/app-frontend/pull/1770), ready for review and targeting `feature/marionette-v5`.
- Decision: keep the current public base-app and component contracts local so removing the v4-only package does not force the Marionette 5 runtime transition into the same review.
- Validation: ESLint and Stylelint pass. `npm run coverage:component` passes all 49 specs and 248 tests. `npm run coverage:e2e` passes all 35 unchanged specs.
- Next action: resolve actionable review feedback, approve deferred Cypress for the final commit, and wait for human merge.

## Friction

- The exact-release pre-install package workflow and bundled consumer skill worked and supplied verifiable release provenance before installation.
- `marionette.toolkit@6.3.0` supports only Marionette 4, so it must be removed before the target package can be installed.
- The toolkit package's source map describes an older Component contract than its executable ESM bundle. A focused component run exposed the mismatch; inspecting the published bundle corrected it. This is toolkit package-source friction, not a Marionette 5 runtime defect.
