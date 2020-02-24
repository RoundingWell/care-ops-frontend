import duration from 'js/utils/duration';

context('duration', function() {
  specify('default', function() {
    expect(duration(60).as('minutes'), 'default seconds').to.equal(1);

    expect(duration(60, 'minutes').as('minutes'), 'w/ key').to.equal(60);
  });

  specify('greaterThan', function() {
    expect(duration(2).greaterThan(duration(1)), 'greaterThan').to.be.true;
    expect(duration(1).greaterThan(duration(2)), 'greaterThan').to.be.false;
    expect(duration(2).lessThan(duration(1)), 'lessThan').to.be.false;
    expect(duration(1).lessThan(duration(2)), 'lessThan').to.be.true;
    expect(duration('01:20:30', 'hh:mm:ss').get()).to.have.property('minutes', 20);
    expect(duration('01:20:30', 'hh:mm:ss').get('hours')).to.equal(1);
    expect(duration('01:20:30', 'hh:mm:ss').formatTime()).to.equal('01:20:30');
  });
});
