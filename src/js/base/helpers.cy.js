import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import { testTs } from 'helpers/test-timestamp';
import formatDate from 'helpers/format-date';

context('Handlebars helpers', function() {
  specify('Match text formatting', function() {
    const MatchTextView = View.extend({
      template: hbs`
        <div class="test-null">{{matchText "Patient Name" null}}</div>
        <div class="test-match">{{matchText "Patient Name" "Patient"}}</div>
      `,
    });

    cy
      .mount(() => {
        return new MatchTextView();
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-null strong')
      .should('not.exist');

    cy
      .get('@root')
      .find('.test-match strong')
      .should('contain', 'Patient');
  });

  specify('Date time formatting', function() {
    const testDate = testTs();

    const DateTimeView = View.extend({
      template: hbs`
        <div class="test-null">{{formatDateTime null "lll"}}</div>
        <div class="test-date">{{formatDateTime testDate "lll"}}</div>
        <div class="test-nowrap">{{formatDateTime testDate "lll" nowrap=false}}</div>
        <div class="test-default-html">{{formatDateTime null "lll" defaultHtml="No Date Available"}}</div>
      `,
      templateContext() {
        return {
          testDate,
        };
      },
    });

    cy
      .mount(() => {
        return new DateTimeView();
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-null')
      .should('be.empty');

    cy
      .get('@root')
      .find('.test-date')
      .should('contain', formatDate(testDate, 'lll'));

    cy
      .get('@root')
      .find('.test-nowrap')
      .find('.u-text--nowrap')
      .should('not.exist');

    cy
      .get('@root')
      .find('.test-default-html')
      .should('contain', 'No Date Available');
  });

  specify('Phone number formatting', function() {
    const PhoneView = View.extend({
      template: hbs`
        <div class="test-null">{{formatPhoneNumber null}}</div>
        <div class="test-phone">{{formatPhoneNumber phone}}</div>
        <div class="test-bad-phone">{{formatPhoneNumber badPhone}}</div>
        <div class="test-default-html">{{formatPhoneNumber null defaultHtml="No Phone Available"}}</div>
      `,
      templateContext() {
        return {
          phone: '6155555551',
          badPhone: 'UNKNOWN',
        };
      },
    });

    cy
      .mount(() => {
        return new PhoneView();
      })
      .as('root');

    cy
      .get('@root')
      .find('.test-null')
      .should('be.empty');

    cy
      .get('@root')
      .find('.test-phone')
      .should('contain', '(615) 555-5551');

    cy
      .get('@root')
      .find('.test-bad-phone')
      .should('be.empty');

    cy
      .get('@root')
      .find('.test-default-html')
      .should('contain', 'No Phone Available');
  });
});
