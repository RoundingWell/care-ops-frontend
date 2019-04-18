[![CircleCI](https://circleci.com/gh/RoundingWell/care-ops-frontend.svg?style=svg)](https://circleci.com/gh/RoundingWell/care-ops-frontend)
[![codecov](https://codecov.io/gh/RoundingWell/care-ops-frontend/branch/master/graph/badge.svg)](https://codecov.io/gh/RoundingWell/care-ops-frontend)

# Getting Started: Frontend

Documentation for the RoundingWell frontend can be found within `README.md` files throughout this repo.

## Dependencies & Installation

We use [npm](npmjs.com) for our package manager

### Node

You will need [Node.js](http://www.nodejs.org). It is recommended that devs [install nvm](https://github.com/creationix/nvm#install-script) the node version manager. NVM allows you to change node versions on the fly.

## Installing Project Dependencies

Then you will need to run
```
$ npm i
```

## Feature Flags

Feature Flags are intended to protect users from new code that isn't fully baked or to allow for gradual rollout.

https://github.com/RoundingWell/RWell/wiki/Feature-Flags#frontend

### Using Feature Flags

Flags are best used such that a minimal amount of changes are made when the flag is being removed.

```javascript
// Bad
function foo() {
    if(flag) {
        doNew();
    } else {
        doOld();
    }
}

// Good
function foo() {
    if(!flag) {
        doOld();
        return;
    }
    doNew();
}
```

It also may be better to duplicate larger areas of code for fewer easier to remove flags.

```javascript
// Bad
function foo() {
    if(flag) foo();
    bar();
    baz();
    if(!flag) bazinga();
    quxx();
}

// Good
function foo() {
    if(!flag) {
      bar();
      baz();
      bazinga();
      quxx();
      return;
    }

    foo();
    bar();
    baz();
    quxx();
}
```

# An Open Source Culture

It is our intention to open source by default.  Ideally any generic solution can be extracted, well documented, and tested.  Open sourcing encourages better code, collaboration with outside developers, and potentially free battle-testing, bugfixes and features from the public.
- [The Case for Open Source](https://opensource.org/advocacy/case_for_business.php)
- [The Culture of Open Source](https://www.thoughtworks.com/insights/blog/culture-open-source)

## Our Libraries

Libraries for public consumption are licensed with the [MIT License](https://opensource.org/licenses/MIT).

Currently our OS projects are available mainly at https://github.com/RoundingWellOS

Each project contains its own documentation for contributions.

## Other Libraries

Additionally we actively encourage contributing to other projects.  Don't know where to start?  Look at documentation or tests for any of the libraries we use.
