import { RenderBodyAs } from "./body.class";
import { ObjectProgram } from "./program.class";
export class TailProgram extends ObjectProgram {
    get vertexShaderSource() {
        return "/shaders/tail.vert.glsl";
    }
    get fragmentShaderSource() {
        return "/shaders/tail.frag.glsl";
    }
    boot() {
        const { gl, program, body } = this;
        gl.useProgram(program);
        body.make(RenderBodyAs.Tails);
        const setVertices = this.setFloat32Attrib("aVertex", body.vertices, 3);
        const setVertexColors = this.setFloat32Attrib("aVertexColor", body.colors, 4);
        this.setUniformLMVP(false, false);
        const rotation = glMatrix.mat4.create();
        const changeRotation = () => {
            glMatrix.mat4.targetTo(rotation, body.coordinates, [0, 0, 0], [0, 1, 0]);
        };
        const uni = this.setUniformMatrix4fv("rotation", rotation);
        const verticesCount = body.vertices.length / 3;
        return () => {
            gl.useProgram(program);
            setVertices();
            setVertexColors();
            changeRotation();
            uni();
            gl.drawArrays(gl.POINTS, 0, verticesCount);
        };
    }
}
