import { RenderBodyAs } from "./body.class.js"
import { ObjectProgram } from "./program.class.js"
const { vec3 } = glMatrix;
export class BodyProgram extends ObjectProgram {
    constructor() {
        super(...arguments);
        this.lightSource = null;
    }
    get vertexShaderSource() {
        return "/shaders/body.vert.glsl";
    }
    get fragmentShaderSource() {
        return "/shaders/body.frag.glsl";
    }
    async setup() {
        this.log("initializing...");
        const gl = this.gl;
        this.tex = await this.loadTexture(gl, this.body.inf.map);
        await super.setup();
        this.log("initialized");
    }
    setLightingSource(body) {
        this.lightSource = body;
    }
    boot() {
        const { gl, body, ether } = this;
        gl.useProgram(this.program);
        body.make(RenderBodyAs.Body);
        const setVertices = this.setFloat32Attrib("aVertex", body.vertices, 3);
        const setTexCoords = this.setFloat32Attrib("aVertexTexCoord", body.texCoords, 2);
        const setNormals = this.setFloat32Attrib("aVertexNormal", body.normals, 3);
        this.setUniform3fv("uAmbientLight", [.02, .02, .02])();
        this.setUniform3fv("uDirectionalLightColor", [1, 1, 1])();
        const lightDir = [0, 0, 0];
        const calculatesLightDir = () => {
            vec3.normalize(lightDir, vec3.sub(lightDir, body.coordinates, this.lightSource ? this.lightSource.coordinates : this.cam.coord));
        };
        calculatesLightDir();
        const setLightSource = this.setUniform3fv("uLightDirection", lightDir);
        // just once.
        const uniform = this.setUniformLMVP();
        const setSampler = this.setUniformTexSampler();
        const setIndices = this.bufferUInt16Array(body.indices);
        const { TRIANGLES, UNSIGNED_SHORT } = gl;
        const indicesCount = body.indices.length;
        const frame01 = () => {
            gl.useProgram(this.program);
            body.selfRotates();
            setIndices();
            setSampler();
            setVertices();
            setNormals();
            setTexCoords();
            calculatesLightDir();
            setLightSource();
            uniform();
            gl.drawElements(TRIANGLES, indicesCount, UNSIGNED_SHORT, 0);
        };
        return frame01;
    }
}
