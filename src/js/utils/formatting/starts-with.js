export default (str, starts) => {
  if (!str || !starts) return;
  str = String(str);
  starts = String(starts);
  return str.lastIndexOf(starts, 0) === 0;
};
