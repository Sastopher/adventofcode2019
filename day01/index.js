import weights from "./weights.js";

function fuel(w) {
  return ((w / 3) | 0) - 2;
}

function sumModulesFuel(ws) {
  return ws.map(fuel).reduce((acc, e) => e + acc);
}

function recurseFuel(initWieght) {
  let sumWeight = initWieght;
  const f = fuel(initWieght);

  if (f <= 0) {
    return 0;
  }

  return f + recurseFuel(f);
}

function sumRecursiveFuel(fs) {
  return fs.map(recurseFuel).reduce((acc, e) => acc + e);
}

function main() {
  console.log("\nDay 1\n");

  console.log("Sum of individual module fuels:");
  console.log(sumModulesFuel(weights));

  console.log("Recursive weight:");
  console.log(sumRecursiveFuel(weights));
}

export { fuel, sumModulesFuel, recurseFuel, sumRecursiveFuel };
export default main;
