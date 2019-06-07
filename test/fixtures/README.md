# Test Fixtures

We should use fixtures stored by entity to compose endpoints.
For most cases the support API mutators should be used to test particular data.
Other than what's in `test/` no fixture data shoud be used in tests.

The files in the root of `fixtures/` are singular resources that are not requested
as collections within the app.

### `collections/`

Collections include arrays of multiple entities. Collections are automatically
generated using faker when starting cypress. To create a new entity collection,
add a file to `fixtures/config/` with the name (i.e. `groups.js`), and follow the
examples already in `config/`. `plugins/faker-generator.js` is setup to use those
files as factories to generate 100 of the faked entity and write that collection out
to `collections/`. The contents of `collections/`, excepting the `.gitkeep` are
ignored from VC. Collections are available to be mutated in testing.

### `test/`

Uses easy to recognize ids `11111`, `22222`, etc to prevent collision but remain
easily recognizable in the tests.
Only data from this directory should show up in the tests and most likely used for
bootstrapped data. We should avoid adding data here if a reasonable alternative exists.
