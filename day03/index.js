import util from "util";

/*
--- Day 3: Crossed Wires ---
The gravity assist was successful, and you're well on your way to the Venus refuelling station. During the rush back on Earth, the fuel management system wasn't completely installed, so that's next on the priority list.

Opening the front panel reveals a jumble of wires. Specifically, two wires are connected to a central port and extend outward on a grid. You trace the path each wire takes as it leaves the central port, one wire per line of text (your puzzle input).

The wires twist and turn, but the two wires occasionally cross paths. To fix the circuit, you need to find the intersection point closest to the central port. Because the wires are on a grid, use the Manhattan distance for this measurement. While the wires do technically cross right at the central port where they both start, this point does not count, nor does a wire count as crossing with itself.

For example, if the first wire's path is R8,U5,L5,D3, then starting from the central port (o), it goes right 8, up 5, left 5, and finally down 3:

...........
...........
...........
....+----+.
....|....|.
....|....|.
....|....|.
.........|.
.o-------+.
...........
Then, if the second wire's path is U7,R6,D4,L4, it goes up 7, right 6, down 4, and left 4:

...........
.+-----+...
.|.....|...
.|..+--X-+.
.|..|..|.|.
.|.-X--+.|.
.|..|....|.
.|.......|.
.o-------+.
...........
These wires cross at two locations (marked X), but the lower-left one is closer to the central port: its distance is 3 + 3 = 6.

Here are a few more examples:

R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83 = distance 159
R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7 = distance 135
What is the Manhattan distance from the central port to the closest intersection?

*/

/*
Ideas

1.
Could represent in a 2d array, incrementing values. Then iterate over the grid
and find the lowest x + y to the origin.

2. Represent as toupled line segments, grouped by wire. Function to identify
intersection. When intersection happens, calculate where and add the coordinate
to a list.

*/

function parseWires(str) {
  return str.split("\n").map(wire => wire.split(","));
}

function drawSegments(wire) {
  let cursor = [0, 0, 0];
  const segments = [];

  wire.forEach(segment => {
    const dir = segment[0];
    const dist = parseInt(segment.slice(1), 10);
    const start = [...cursor];
    const end = walkPath(start, dir, dist);
    cursor = [...end];
    segments.push([start, end]);
  });
  return segments;
}

function walkPath(start, dir, dist) {
  switch (dir) {
    case "U":
      return [start[0], start[1] + dist, start[2] + dist];
    case "R":
      return [start[0] + dist, start[1], start[2] + dist];
    case "D":
      return [start[0], start[1] - dist, start[2] + dist];
    case "L":
      return [start[0] - dist, start[1], start[2] + dist];
    default:
      console.log(dir);
      throw new Error("Unknown direction");
  }
}

function testIntersections([wire1, wire2]) {
  const intersections = [];
  wire1.forEach(segment1 => {
    wire2.forEach(segment2 => {
      const intersection = testIntersectionOrthogonal(segment1, segment2);
      if (intersection) {
        intersections.push(intersection);
      }
    });
  });

  return intersections;
}

function closestIntersectionDistance(intersections) {
  // return Math.min(...intersections.map(([x, y]) => Math.abs(x) + Math.abs(y)));
  return Math.min(...intersections.map(([x, y, d]) => d));
}

function testIntersectionOrthogonal([p1, p2], [q1, q2]) {
  const [p1x, p1y, p1d] = p1;
  const [p2x, p2y, p2d] = p2;
  const [q1x, q1y, q1d] = q1;
  const [q2x, q2y, q2d] = q2;

  const pLeftRight = p1y === p2y;
  const qLeftRight = q1y === q2y;

  if (pLeftRight === qLeftRight) {
    // Only count intersections that cross perpandicular, not that overlap.
    return false;
  }

  if (pLeftRight) {
    if (testBetween(p1x, q1x, p2x) && testBetween(q1y, p1y, q2y)) {
      // qLeftRight implies qx are the same and py are the same, which also
      // implies this is the intersection.
      // TODO find intersectional distance
      const dist = p1d + q1d + Math.abs(p1x - q1x) + Math.abs(p1y - q1y);
      return [q1x, p1y, dist];
    } else {
      return false;
    }
  }

  if (testBetween(p1y, q1y, p2y) && testBetween(q1x, p1x, q2x)) {
    // pLeftRight implies px are the same and qy are the same, which also
    // implies this is the intersection.
    const dist = p1d + q1d + Math.abs(p1x - q1x) + Math.abs(p1y - q1y);
    return [p1x, q1y, dist];
  } else {
    return false;
  }
}

function testBetween(p, q, r) {
  return q > Math.min(p, r) && q < Math.max(p, r);
}

function testIntersectionOrientation(segment1, segment2) {
  // const [[x1, y1], [x2, y2]] = segment1;
  // const [[x3, y3], [x4, y4]] = segment2;
  const [p1, p2] = segment1;
  const [q1, q2] = segment2;

  const o1 = orientation(p1, p2, q1);
  const o2 = orientation(p1, p2, q2);
  const o3 = orientation(q1, q2, p1);
  const o4 = orientation(q1, q2, p2);

  // Test the general case
  if (o1 != o2 && o3 != o4) {
    return true;
  }

  // Special cases (colinear)
  // TODO
}

/**
 * Determine the orientation of three points for purposes of detecting
 * intersections.
 *
 * 1  --> Clockwise
 * 0  --> Colinear
 * -1 --> Counterclockwise
 *
 * See:
 *   http://www.dcs.gla.ac.uk/~pat/52233/slides/Geometry1x1.pdf
 *   https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
 */
function orientation(p, q, r) {
  const [px, py] = p;
  const [qx, qy] = q;
  const [rx, ry] = r;
  const k = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);

  if (k === 0) return 0;
  return k > 0 ? 1 : -1;
}

/**
 * Given three colinear points, determine if q lies on (or outside) pr
 */
function onSegment(p, q, r) {
  const [px, py] = p;
  const [qx, qy] = q;
  const [rx, ry] = r;

  return (
    qx <= Math.max(px, rx) &&
    qx >= Math.min(px, rx) &&
    qy <= Math.max(py, ry) &&
    qy >= Math.min(py, ry)
  );
}

function closestIntersection(inputStr) {
  const wirePaths = parseWires(inputStr);

  console.log(wirePaths);
  const wireSegments = wirePaths.map(drawSegments);

  console.log(util.inspect(wireSegments, false, 4));
  const intersections = testIntersections(wireSegments);

  console.log(intersections);
  console.log(closestIntersectionDistance(intersections));
}

function main() {
  console.log("\nDay 3\n");
  // closestIntersection(testInput0);
  // closestIntersection(testInput1);
  // closestIntersection(testInput2);
  closestIntersection(input);
}

const testInput0 = `R8,U5,L5,D3
U7,R6,D4,L4`;
const testInput1 = `R75,D30,R83,U83,L12,D49,R71,U7,L72
U62,R66,U55,R34,D71,R55,D58,R83`;
const testInput2 = `R98,U47,R26,D63,R33,U87,L62,D20,R33,U53,R51
U98,R91,D20,R16,D67,R40,U7,R15,U6,R7`;
const input = `R995,D882,R144,U180,L638,U282,L907,D326,R731,D117,R323,U529,R330,U252,R73,U173,R345,U552,R230,U682,R861,U640,L930,U590,L851,D249,R669,D878,R951,D545,L690,U392,R609,D841,R273,D465,R546,U858,L518,U567,L474,D249,L463,D390,L443,U392,L196,U418,R433,U651,R520,D450,R763,U714,R495,D716,L219,D289,L451,D594,R874,U451,R406,U662,R261,D242,R821,D951,R808,D862,L871,U133,R841,D465,R710,U300,R879,D497,R85,U173,R941,U953,R705,U972,R260,D315,L632,U182,L26,D586,R438,U275,L588,U956,L550,D576,R738,U974,R648,D880,R595,D510,L789,U455,R627,U709,R7,D486,L184,U999,L404,U329,L852,D154,L232,U398,L587,U881,R938,D40,L657,D164,R45,D917,R106,U698,L824,D426,R879,U700,R847,D891,L948,U625,R663,D814,R217,U30,R610,D781,L415,D435,L904,U815,R152,U587,R287,U141,R866,D636,L290,D114,L751,D660,R6,U383,L263,U799,R330,U96,L6,U542,L449,D361,R486,U278,L990,U329,L519,U605,R501,D559,R916,U198,L499,D174,R513,U396,L473,D565,R337,D770,R211,D10,L591,D920,R367,D748,L330,U249,L307,D645,R661,U266,R234,D403,L513,U443,L989,D1,L674,D210,L537,D872,L607,D961,R894,U632,L195,U744,L426,U531,R337,D821,R113,U436,L700,U779,R555,U891,R268,D30,R958,U411,R904,U24,R760,D958,R231,U229,L561,D134,L382,D961,L237,U676,L223,U324,R663,D186,R833,U188,R419,D349,L721,U152,L912,U490,R10,D995,L98,U47,R140,D815,R826,U730,R808,U256,R479,D322,L504,D891,L413,D848,L732,U375,L307,U7,R682,U270,L495,D248,R691,D945,L70,U220,R635,D159,R269,D15,L161,U214,R814,D3,R354,D632,R469,D36,R85,U215,L243,D183,R140,U179,R812,U180,L905,U136,L34,D937,L875
L999,D22,L292,U843,R390,U678,R688,D492,L489,U488,R305,U951,L636,U725,R402,U84,L676,U171,L874,D201,R64,D743,R372,U519,R221,U986,L393,D793,R72,D184,L553,D137,L187,U487,L757,U880,L535,U887,R481,U236,L382,D195,L388,D90,R125,U414,R512,D382,R972,U935,L172,D1,R957,U593,L151,D158,R396,D42,L30,D178,R947,U977,R67,D406,R744,D64,L677,U23,R792,U864,R259,U315,R314,U17,L37,D658,L642,U135,R624,U601,L417,D949,R203,D122,R76,D493,L569,U274,L330,U933,R815,D30,L630,D43,R86,U926,L661,D491,L541,D96,R868,D565,R664,D935,L336,D152,R63,U110,L782,U14,R172,D945,L732,D870,R404,U767,L907,D558,R748,U591,R461,D153,L635,D457,R241,U478,L237,U218,R393,U468,L182,D745,L388,D360,L222,D642,L151,U560,R437,D326,R852,U525,R717,U929,L470,U621,R421,U408,L540,D176,L69,U753,L200,U251,R742,U628,R534,U542,R85,D71,R283,U905,L418,D755,L593,U335,L114,D684,L576,D645,R652,D49,R86,D991,L838,D309,L73,U847,L418,U675,R991,U463,R314,D618,L433,U173,R869,D115,L18,U233,R541,U516,L570,U340,R264,D442,L259,U276,R433,D348,R524,D353,R336,D883,R580,U157,R79,D27,L134,D161,L748,D278,R322,D581,R654,D156,L930,D293,L156,U311,R807,D618,R408,U719,R366,D632,R307,D565,R478,D620,R988,D821,R365,D581,L946,D138,L943,U69,R620,U208,L407,U188,L122,U353,L751,U565,R849,D874,R668,D794,L140,D474,R289,D773,R344,D220,L55,D385,L394,U208,R305,U736,L896,D376,R331,D855,L466,U516,L741,U124,L825,U467,L525,D911,R76,U220,L610,U102,L261,D891,L585,U397,L152,U753,R822,D252,R106,U145,L7,U524,R343,U352,L357,D399,L446,D140,L723,U46,R687,D409,R884`;

export default main;
