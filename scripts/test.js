import { RAD_PER_DEGREE } from "./constants.js"
const pos = glMatrix.vec3.fromValues(2, 2, 4);
const projection = m4.perspective(m4.create(), 45 * RAD_PER_DEGREE, 3, 1 / 1, 100);
const lookat = m4.lookAt(m4.create(), [0, 0, 0], [0, 0, 1], [0, 1, 0]);
const inverse = m4.invert(m4.create(), lookat);
const viewpos = v3.transformMat4([0, 0, 0], pos, lookat);
const output = v3.transformMat4([0, 0, 0], viewpos, inverse);
// const ndcPos = output.map(c => c / output[3])
console.log(...output);
console.log(...viewpos);
//console.log(...ndcPos)
