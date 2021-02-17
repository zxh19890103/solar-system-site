var WORKER_SCRIPT_URL = "/scripts/loop.js"
var GLMATRIX_SCRIPT_URL = "/scripts/gl-matrix-min.js"

if (globalThis) {
  globalThis.WORKER_SCRIPT_URL = WORKER_SCRIPT_URL
  globalThis.GLMATRIX_SCRIPT_URL = GLMATRIX_SCRIPT_URL
}