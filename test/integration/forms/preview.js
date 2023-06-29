import _ from 'underscore';

import { testDate } from 'helpers/test-date';

import fxTestFormKitchenSink from 'fixtures/test/form-kitchen-sink';

context('Preview Form', function() {
  specify('routing to form', function() {
    cy
      .routeForm(_.identity, '11111')
      .intercept('GET', '/api/forms/*/definition', {
        body: fxTestFormKitchenSink,
      })
      .as('routeFormKitchenSink')
      .visit('/form/11111/preview')
      // NOTE: https://github.com/formio/formio.js/issues/3489
      // Issue started at v4.12.rc-1
      .wait(500);

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/preview');

    cy
      .iframe()
      .as('iframe')
      .wait('@routeFormKitchenSink');

    cy
      .get('@iframe')
      .find('.formio-component')
      .as('formIOComponent')
      .find('input[type=text]')
      .first()
      .type('hello')
      .should('have.value', 'hello');

    cy
      .get('@formIOComponent')
      .find('input[type=checkbox]')
      .first()
      .click()
      .should('be.checked');

    cy
      .get('@formIOComponent')
      .find('input[type=radio]')
      .first()
      .click()
      .should('be.checked');

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__input--cloned')
      .first()
      .type('item 1{enter}item 2{enter}');

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__item')
      .first()
      .should('contain', 'item 1')
      .next()
      .should('contain', 'item 2')
      .find('button')
      .click();

    cy
      .get('@formIOComponent')
      .find('.formio-component-tags .choices__inner .choices__item')
      .should('have.length', 1);

    cy
      .get('@formIOComponent')
      .find('.formio-component-datetime .input-group')
      .click();

    cy
      .get('@iframe')
      .find('.flatpickr-calendar')
      .find('.flatpickr-day.today')
      .click('center');

    cy
      .get('@formIOComponent')
      .find('.formio-component-datetime input[type=text]')
      .should('have.value', `${ testDate() } 12:00 PM`);

    cy
      .get('@formIOComponent')
      .find('[name="data[version]"]')
      .should('have.value', 22);

    cy
      .get('.form__title')
      .should('contain', 'Test Form');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', '/worklist/owned-by');

    cy
      .go('back');
  });
});
