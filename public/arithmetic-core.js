(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Calculator = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function calculate(first, operator, second) {
    const a = Number(first);
    const b = Number(second);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new TypeError('Enter two valid numbers.');
    }
    let result;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/':
        if (b === 0) throw new RangeError('Cannot divide by zero.');
        result = a / b;
        break;
      default: throw new TypeError('Choose a valid operation.');
    }
    return Number.isFinite(result) ? Number(result.toPrecision(12)) : result;
  }
  return { calculate };
});
