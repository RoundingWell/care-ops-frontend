import fieldsTemplate from 'js/utils/fields-template';

context('fieldsTemplate', function() {
  specify('correct data reference', function() {
    const template = fieldsTemplate('Test: {{ fields.that.is.a.test }}');

    expect(template.fieldNames).to.be.an('array').that.includes('that');
    expect(template({ that: { is: { a: { test: 21 } } } })).to.equal('Test: 21');
  });

  specify('incorrect data reference', function() {
    const template = fieldsTemplate('Test: {{ that.is.a.test }}');

    expect(template.fieldNames).to.be.an('array').with.lengthOf(0);
    expect(template({ that: { is: { a: { test: 21 } } } })).to.be.empty;
  });

  specify('template with html and special characters', function() {
    const template = fieldsTemplate('<p>Test: \n{{ fields.that.is.a.test }}</p>');

    expect(template({ that: { is: { a: { test: 21 } } } })).to.equal('<p>Test:  n21</p>');
  });
});
