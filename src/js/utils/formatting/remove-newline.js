export default str => {
  return str && str.replace(/(\r\n|\n|\r)/gm, ' ');
};
