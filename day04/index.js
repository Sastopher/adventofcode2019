function solvesForRange([lower, upper]) {
  const solves = [];
  for (let i = lower; lower <= upper; lower++) {
    if (rule1(i) && rule2(i) && rule3(i)) {
      solves.push(i);
    }
  }
  return solves;
}

function rule1(num) {
  return false;
}

function rule2(num) {
  return false;
}

function rule3(num) {
  return false;
}

function main() {
  const range = [183564, 657474];
  const solves = solvesForRange(range);
  console.log(solves);
}

export default main;
