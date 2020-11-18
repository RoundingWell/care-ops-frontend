import trim from 'js/utils/formatting/trim';

export default str => {
  if (!str) return str;

  return trim(str).replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toLowerCase();
};
