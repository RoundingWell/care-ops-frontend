# Test Fixtures

We should use fixtures stored by entity to compose endpoints.
For most cases the support API mutators should be used to test particular data.
Other than what's in `tests/` no fixture data shoud be used in tests.
Ideally the fixture data (other than tests) can be randomly generated in the future.

The files in the root of `fixtures/` are singular resources that are not requested
as collections within the app.

### `collections/`

Collections include arrays of multiple entities.

### `tests/`

Uses easy to recognize ids `11111`, `22222`, etc to prevent collision but remain
easily recognizable in the tests.
Only data from this directory should show up in the tests and most likely used for
bootstrapped data. We should avoid adding data here if a reasonable alternative exists.
