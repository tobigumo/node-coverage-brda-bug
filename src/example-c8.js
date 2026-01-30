function getValue(condition) {
  if (condition) {
    return 'truthy';
  }
  /* c8 ignore next */
  return 'falsy';
}

module.exports = { getValue };
