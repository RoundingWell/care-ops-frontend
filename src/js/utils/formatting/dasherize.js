import trim from 'js/utils/formatting/trim';

export default str => {
  return trim(str).replace(/([A-Z])/g, '-$1').replace(/[-_\s]+/g, '-').toLowerCase();
};
