const argsEmpCheck = (args) => {
  if (args.length === 0) {
    throw new Error('Arguments should be number.');
  }
}

const argsLengthCheck = (args) => {
  if (args.length > 30) {
    throw new Error('Arguments should be less than 30.');
  }
};

const argsTypeCheck = (args) => {
  if (args.some((arg) => typeof arg === 'string')) {
    throw new Error('Arguments should be more than 0.');
  }
}


export const add = (numbers) => {
  argsEmpCheck(numbers);
  argsLengthCheck(numbers);
  argsTypeCheck(numbers);

  const result = numbers.reduce(
    (previousValue, currentValue) => previousValue + currentValue
  )

  if (result > 1000) {
    return 'too big';
  }
  return result;
}

export const subtract = (numbers) => {
  argsEmpCheck(numbers);
  argsLengthCheck(numbers);
  argsTypeCheck(numbers);

  const result = numbers.reduce(
    (previousValue, currentValue) => previousValue - currentValue
  );

  if (result < 0) {
    return 'negative number';
  }
  return result;
}

export const multiply = (numbers) => {
  argsEmpCheck(numbers);
  argsLengthCheck(numbers);
  argsTypeCheck(numbers);

  const result = numbers.reduce(
    (previousValue, currentValue) => previousValue * currentValue
  );

  if (result > 1000) {
    return 'big big number';
  }
  return result;
}

export const divide = (numbers) => {
  argsEmpCheck(numbers);
  argsLengthCheck(numbers);
  argsTypeCheck(numbers);

  const result = numbers.reduce(
    (previousValue, currentValue) => previousValue / currentValue
  );

  if (!Number.isInteger(result)) {
    return 'decimals number';
  }
  return result;
}
