export default (str = '', characters) => {
  str = String(str);
  if (!characters) return str.trim();
  return str.replace(new RegExp(`^${ characters }+|${ characters }+$`, 'g'), '');
};
