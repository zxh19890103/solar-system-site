import { RenderBodyAs } from "./body.class.js"
import { ObjectProgram } from "./program.class.js"
import { range } from "./utils.js"
export class PointProgram extends ObjectProgram {
    get vertexShaderSource() {
        return "shaders/point.vert.glsl";
    }
    get fragmentShaderSource() {
        return "shaders/point.frag.glsl";
    }
    boot() {
        const { gl, program, body, ether } = this;
        const inf = body.inf;
        const { PI, sin } = Math;
        gl.useProgram(program);
        body.make(RenderBodyAs.Point);
        const color = [...inf.color];
        const setColor = this.setUniform4fv("uVertexColor", color);
        const setVertex = this.setFloat32Attrib("aVertex", body.vertices, 3);
        let alpha = 0 ^ range(0, PI) * 100;
        const uniform = this.setUniformLMVP();
        return () => {
            gl.useProgram(program);
            color[3] = sin((alpha % 314) * .01);
            setVertex();
            setColor();
            uniform();
            alpha += 3;
            gl.drawArrays(gl.POINTS, 0, 1);
        };
    }
}
