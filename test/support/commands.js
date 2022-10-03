import _ from 'underscore';

// ***********************************************
// This example commands.js shows you how to
// create the custom command: 'login'.
//
// The commands.js file is a great place to
// modify existing commands and create custom
// commands for use throughout your tests.
//
// You can read more about custom commands here:
// https://on.cypress.io/api/commands
// ***********************************************
//

Cypress.Commands.add('unit', cb => cy.window().then(win => {
  cb && cb.call(win, win);
}));

Cypress.Commands.add('visitComponent', ComponentName => {
  cy
    .visit();

  if (!ComponentName) return;

  cy
    .window()
    .its('Components')
    .its(ComponentName)
    .as(ComponentName);
});

Cypress.Commands.add('getRadio', cb => {
  cy
    .window()
    .should('have.property', 'Radio')
    .then(Radio => {
      cb(Radio);
    });
});

Cypress.Commands.add('getHook', cb => {
  Cypress.$('body').prepend(`
    <div style="position:absolute;height:100%;width:100%;background:#EEE;z-index:0">
      <div id="cy-hook"></div>
    </div>
  `);

  Cypress.$('.app-frame').hide();

  cy
    .get('#cy-hook')
    .as('hook')
    .then(cb);
});

Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
  let waits = [
    '@routeCurrentClinician',
    '@routeStates',
    '@routeTeams',
    '@routeRoles',
    '@routeForms',
    '@routeGroups',
    '@routeClinicians',
  ];

  if (!url) {
    url = Cypress.env('defaultRoute');
    waits.push('@routeFlows'); // default route
  }

  if (options.noWait) {
    waits = 0;
  }

  // pageLoadTimeout for visit is 60000ms
  return cy
    .wrap(originalFn(url, options), { timeout: 60000 })
    .wait(waits);
});

Cypress.Commands.add('navigate', url => {
  cy
    .window()
    .its('Backbone')
    .its('history')
    .invoke('navigate', url, { trigger: true });
});

Cypress.Commands.add('iframe', (getSelector = 'iframe') => {
  cy
    .get(getSelector)
    .its('0.contentDocument.body')
    .should('not.be.empty')
    .then(cy.wrap);
});

Cypress.Commands.add('typeEnter', { prevSubject: true }, $el => {
  if (!$el) return;

  cy
    .wrap($el)
    // cypress-plugin-tab can cause issues with focus/typing
    .blur()
    // Need force because Cypress does not recognize the element is typeable
    .type('{enter}', { force: true });
});

// Exposes the hostname and decoded pathname and search query of an alias
Cypress.Commands.add('itsUrl', { prevSubject: true }, alias => {
  cy
    .wrap(alias)
    .its('request.url')
    .then(url => {
      const { hostname, pathname, search } = new URL(url);

      return { hostname, pathname: decodeURI(pathname), search: decodeURIComponent(search) };
    });
});

Cypress.Commands.overwrite('route', (originalFn, options) => {
  const routeMatcher = {
    method: options.method || 'GET',
    url: options.url,
  };
  const staticResponse = {
    statusCode: options.status || 200,
    body: _.isFunction(options.response) ? options.response.call(Cypress.state('runnable').ctx, options) : options.response,
    delay: options.delay || 0,
  };
  return cy.intercept(routeMatcher, staticResponse);
});

Cypress.Commands.add('hasBeforeContent', { prevSubject: true }, ($el, content) => {
  cy.window().then(win => {
    const before = win.getComputedStyle($el[0], '::before');
    const beforeContent = before.getPropertyValue('content');

    expect(beforeContent).to.equal(`"${ content }"`);
  });
});
