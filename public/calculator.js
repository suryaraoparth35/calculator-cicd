const form = document.querySelector('#calculator-form');
const result = document.querySelector('#result');
const label = document.querySelector('#display-label');
const first = document.querySelector('#first-number');
const second = document.querySelector('#second-number');
const operator = document.querySelector('#operator');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  try {
    const value = Calculator.calculate(first.value, operator.value, second.value);
    result.textContent = String(value);
    label.textContent = `${first.value} ${operator.value} ${second.value} =`;
    label.classList.remove('error');
  } catch (error) {
    result.textContent = '?';
    label.textContent = error.message;
    label.classList.add('error');
  }
});

document.querySelector('#clear-button').addEventListener('click', () => {
  form.reset();
  result.textContent = '0';
  label.textContent = 'READY WHEN YOU ARE';
  label.classList.remove('error');
  first.focus();
});
