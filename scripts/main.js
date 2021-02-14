/**
 * idea.
 *
 * as a body:
 * N vertices.
 * center: A center position [0, 0, 0] in the local coord system.
 * local matrix: A matrix to rotate the body by the Z axis of local coordinates system.
 * model matrix: A matrix to transform the position of the body into the world coord system.
 *
 * What changes?
 * 1. local matrix for rotating.
 * 2. model matrix for translating.
 *
 * What's immutable?
 * 1. N vertices
 * 2. the center.
 */
import { Ceres, Earth, Jupiter, Mars, Mercury, Neptune, Saturn, Sun, Uranus, Venus, Eris, Pluto, Halley, Tempel1, Holmes, HaleBopp, Luna, Lo, Europa, Ganymede, Callisto, Titan, Rhea, Enceladus, Mimas, Tethys, Dione, Iapetus, Proteus, Triton, Nereid } from "./body-info.js"
import { BodyProgram } from "./body-program.class.js"
import { Body, RenderBodyAs } from "./body.class.js"
import { Camera } from "./camera.class.js"
import { CircleProgram } from "./circle-program.class.js"
import { Ether } from "./ether.js"
import { PointProgram } from "./point-program.class.js"
import { BallProgram } from "./ball-program.class.js"
import { OrbitProgram } from "./orbit-program.class.js"
import { RingsProgram } from "./rings-program.class.js"
import { AU } from "./constants.js"
import { TailProgram } from "./tail-program.class.js"
let W = 0;
let H = 0;
let gl;
let cam;
let ether;
const setupGLContext = () => {
    const canvasElement = document.createElement("canvas");
    W = window.innerWidth;
    H = window.innerHeight;
    canvasElement.width = W;
    canvasElement.height = H;
    document.body.appendChild(canvasElement);
    gl = canvasElement.getContext("webgl");
};
const createProgram = (rba = RenderBodyAs.Point) => {
    let program = null;
    {
        switch (rba) {
            case RenderBodyAs.Point:
                program = new PointProgram(gl, cam, ether);
                break;
            case RenderBodyAs.Circle:
                program = new CircleProgram(gl, cam, ether);
                break;
            case RenderBodyAs.Ball:
                program = new BallProgram(gl, cam, ether);
                break;
            case RenderBodyAs.Body:
                program = new BodyProgram(gl, cam, ether);
                break;
            case RenderBodyAs.Orbit:
                program = new OrbitProgram(gl, cam, ether);
                break;
            case RenderBodyAs.Rings:
                program = new RingsProgram(gl, cam, ether);
                break;
            case RenderBodyAs.Tails:
                program = new TailProgram(gl, cam, ether);
                break;
        }
    }
    return program;
};
const createBody = (inf, rba = RenderBodyAs.Point) => {
    const body = inf instanceof Body ? inf : new Body(inf);
    ether.put(body);
    const prog = createProgram(rba);
    body.useProgram(prog);
    return body;
};
const createBodies = (...items) => {
    let body = null;
    let created = false;
    for (const item of items) {
        if (typeof item === "number") {
            if (body !== null) {
                createBody(body, item);
                created = true;
            }
        }
        else {
            if (body !== null && !created)
                createBody(body);
            body = item instanceof Body ? item : new Body(item);
            created = false;
        }
    }
    if (body !== null && !created)
        createBody(body);
};
const run = async () => {
    const distance = cam.far;
    if (distance / AU > .099) {
        ether.writeLine(`You're ${(distance / AU).toFixed(6)} AU far from the target body.`);
    }
    else {
        ether.writeLine(`You're ${(distance * 1000).toFixed(2)} km far from the target body.`);
    }
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL);
    const frames = await ether.boot();
    const loop = () => {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        frames.forEach(f => f());
        ether.move();
        requestAnimationFrame(loop);
    };
    ether.connectsWithWorker(worker);
    loop();
};
const solar = async () => {
    setupGLContext();
    cam = new Camera(W / H);
    ether = new Ether(1000, 50);
    const sun = new Body(Sun);
    createBodies(sun, RenderBodyAs.Point, Mercury, RenderBodyAs.Orbit, Venus, RenderBodyAs.Orbit, Earth, RenderBodyAs.Orbit, Mars, RenderBodyAs.Orbit, Jupiter, RenderBodyAs.Point, RenderBodyAs.Orbit, Saturn, RenderBodyAs.Point, RenderBodyAs.Orbit, Uranus, RenderBodyAs.Orbit, Neptune, RenderBodyAs.Point, RenderBodyAs.Orbit, Ceres, RenderBodyAs.Orbit, Eris, RenderBodyAs.Orbit, Pluto, RenderBodyAs.Orbit);
    cam.put([
        0, -Mars.aphelion, Mercury.aphelion
    ])
        .lookAt(sun)
        .adjust(Math.PI * (120 / 180), // human naked eyes.
            100, Infinity);
    run();
};
const comets = async () => {
    setupGLContext();
    cam = new Camera(W / H);
    ether = new Ether(7000, 30);
    const sun = new Body(Sun).center();
    const tempel1 = new Body(Tempel1);
    const homes = new Body(Holmes);
    const halley = new Body(Halley);
    const haleBopp = new Body(HaleBopp);
    createBodies(sun, RenderBodyAs.Point, tempel1, RenderBodyAs.Orbit, RenderBodyAs.Tails, homes, RenderBodyAs.Orbit, RenderBodyAs.Tails, halley, RenderBodyAs.Orbit, RenderBodyAs.Tails, haleBopp, RenderBodyAs.Orbit, RenderBodyAs.Tails);
    cam.put([
        .2, 5 * AU, AU * .3
    ]).lookAt(sun)
        .adjust(Math.PI * (120 / 180), // human naked eyes.
            100, Infinity);
    run();
};
const earthSys = async () => {
    setupGLContext();
    cam = new Camera(W / H);
    ether = new Ether(100, 10);
    const earth = new Body(Earth).center();
    const luna = new Body(Luna);
    createBodies(earth, RenderBodyAs.Body, luna, RenderBodyAs.Body, RenderBodyAs.Orbit);
    cam.put([
        0, -384, 1
    ])
        .lookAt(earth)
        .adjust(Math.PI * (10 / 180), // human naked eyes.
            .1, Infinity);
    run();
};
const jupiterSys = async () => {
    setupGLContext();
    cam = new Camera(W / H);
    ether = new Ether();
    const jupiter = new Body(Jupiter).center();
    createBodies(jupiter, RenderBodyAs.Body, Lo, RenderBodyAs.Orbit, Europa, RenderBodyAs.Orbit, Ganymede, RenderBodyAs.Orbit, Callisto, RenderBodyAs.Orbit);
    const cameraCoords = [
        0, -1297, 900
    ];
    // lo.face(cameraCoords)
    // europa.face(cameraCoords)
    // ganymede.face(cameraCoords)
    // callisto.face(cameraCoords)
    cam.put(cameraCoords)
        .lookAt(jupiter)
        .adjust(Math.PI * (120 / 180), // human naked eyes.
            100, Infinity);
    run();
};
const saturnSys = async () => {
    setupGLContext();
    cam = new Camera(W / H);
    ether = new Ether();
    const saturn = new Body(Saturn).center();
    const tian = new Body(Titan);
    const rhea = new Body(Rhea);
    const enceladus = new Body(Enceladus);
    createBodies(saturn, RenderBodyAs.Body, RenderBodyAs.Rings, Mimas, RenderBodyAs.Orbit, Tethys, RenderBodyAs.Orbit, Dione, RenderBodyAs.Orbit, tian, RenderBodyAs.Orbit, rhea, RenderBodyAs.Orbit, enceladus, RenderBodyAs.Orbit, Iapetus, RenderBodyAs.Orbit);
    cam.put([0, -Rhea.aphelion, 300])
        .lookAt(saturn)
        .adjust(Math.PI * (120 / 180), // human naked eyes.
            100, Infinity);
    run();
};
const neptuneSys = async () => {
    setupGLContext();
    cam = new Camera(W / H);
    ether = new Ether(10, 10);
    const neptune = new Body(Neptune).center();
    createBodies(neptune, RenderBodyAs.Body, Proteus, RenderBodyAs.Orbit, Triton, RenderBodyAs.Orbit, Nereid, RenderBodyAs.Orbit);
    cam.put([0, -Proteus.semiMajorAxis, 10])
        .lookAt(neptune)
        .adjust(Math.PI * (120 / 180), // human naked eyes.
            10, Infinity);
    run();
};
const single = async (name) => {
    setupGLContext();
    let inf = [
        Ceres, Earth, Jupiter, Mars, Mercury, Neptune,
        Saturn, Sun, Uranus, Venus, Eris, Pluto, Ceres
    ].find(x => x.name === name);
    if (inf === undefined || inf === null)
        inf = Earth;
    cam = new Camera(W / H);
    ether = new Ether();
    const pluto = new Body(inf).center();
    if (inf.rings) {
        createBodies(pluto, RenderBodyAs.Body, RenderBodyAs.Rings);
    }
    else {
        createBodies(pluto, RenderBodyAs.Body);
    }
    cam.put([0, -inf.radius * 3, inf.radius * .68])
        .lookAt(pluto)
        .adjust(Math.PI * (120 / 180), // human naked eyes.
            .1, Infinity);
    run();
};
const worker = new Worker("scripts/loop.js");
const match = location.search.match(/\?sys=([a-zA-Z]+)/);
if (match === null) {
    single("Earth");
}
else {
    const [, sys] = match;
    switch (sys) {
        case "solar":
            solar();
            break;
        case "jupiter":
            jupiterSys();
            break;
        case "saturn":
            saturnSys();
            break;
        case "earth":
            earthSys();
            break;
        case "neptune":
            neptuneSys();
            break;
        case "comets":
            comets();
            break;
        default:
            single(sys);
            break;
    }
}
