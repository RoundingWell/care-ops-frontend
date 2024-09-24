import { testDate } from 'helpers/test-date';

import { fxTestFormKitchenSink } from 'support/api/form-responses';
import { testForm } from 'support/api/forms';

context('Preview Form', function() {
  specify('routing to form', function() {
    cy
      .routeForm(fx => {
        fx.data = testForm;

        return fx;
      })
      .intercept('GET', '/api/forms/*/definition', {
        body: fxTestFormKitchenSink,
      })
      .as('routeFormKitchenSink')
      .visit(`/form/${ testForm.id }/preview`)
      .wait(300); // NOTE: must wait due to debounce in iframe

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
