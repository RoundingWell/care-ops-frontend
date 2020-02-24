import initPlatform from 'js/utils/platform';

context('platform', function() {
  specify('initPlatform', function() {
    cy
      .unit(() => {
        initPlatform();

        const docEl = document.documentElement;
        const docUa = docEl.getAttribute('data-useragent');
        const docPlat = docEl.getAttribute('data-platform');

        expect(docUa, 'user-agent').to.equal(navigator.userAgent);
        expect(docPlat, 'platform').to.equal(navigator.platform);
      });
  });
});
