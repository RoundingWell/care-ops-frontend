// finds results from a query string within the text passed
// and wraps it in the pretag posttag.  Defaulting to <strong></strong>

import buildMatcher from 'js/utils/formatting/build-matcher';

export default (text, query, pretag, posttag) => {
  if (!text) return;

  pretag = pretag || 'strong';
  posttag = posttag || pretag;

  const matcher = buildMatcher(query);

  return text.replace(matcher, `<${ pretag }>$&</${ posttag }>`);
};
