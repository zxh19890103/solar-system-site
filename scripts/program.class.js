import { isPowerOfTwo } from "./utils";
export class ObjectProgram {
    constructor(gl, cam, ether) {
        this.gl = gl;
        this.ether = ether;
        this.cam = cam;
    }
    log(...data) {
        console.log("program: ", ...data);
    }
    async setup() {
        const vsCode = await this.loadRemoteShaderCode(this.vertexShaderSource);
        const fsCode = await this.loadRemoteShaderCode(this.fragmentShaderSource);
        this.initShaderProgram(vsCode, fsCode);
        // link program in the next mircotasks together..
        // await this.link()
    }
    initShaderProgram(vsCode, fsCode) {
        const gl = this.gl;
        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsCode);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsCode);
        // Create the shader program
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        // If creating the shader program failed, alert
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
        this.program = shaderProgram;
    }
    loadShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        // Send the source to the shader object
        gl.shaderSource(shader, source);
        // Compile the shader program
        gl.compileShader(shader);
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    loadRemoteShaderCode(url) {
        return fetch(url).then((resp) => {
            return resp.text();
        });
    }
    async loadTexture(gl, url) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const img = await this.loadImage(url);
        gl.texImage2D(gl.TEXTURE_2D, 0, // level
        gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        if (isPowerOfTwo(img.naturalWidth) && isPowerOfTwo(img.naturalHeight)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        return tex;
    }
    loadImage(url) {
        return new Promise((done, fail) => {
            const img = new Image();
            img.onload = () => {
                done(img);
            };
            img.onerror = fail;
            img.src = url;
        });
    }
    setUniformTexSampler() {
        const gl = this.gl;
        gl.activeTexture(gl.TEXTURE0);
        const loc = gl.getUniformLocation(this.program, "uSampler");
        gl.uniform1i(loc, 0);
        return () => {
            gl.bindTexture(gl.TEXTURE_2D, this.tex);
            // gl.activeTexture(gl.TEXTURE0)
            gl.uniform1i(loc, 0);
        };
    }
    setFloat32Attrib(attribName, data, pointerSize) {
        const { gl, program } = this;
        const farray = new Float32Array(data);
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, farray, gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, attribName);
        return (data) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            if (data !== undefined) {
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            }
            gl.enableVertexAttribArray(loc);
            gl.vertexAttribPointer(loc, pointerSize, gl.FLOAT, false, 0, 0);
        };
    }
    /**
     * no GPU upload.
     */
    bufferUInt16Array(int16Array) {
        const gl = this.gl;
        const indicesBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(int16Array), gl.STATIC_DRAW);
        return () => {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
        };
    }
    setUniform3fv(name, value) {
        const { gl, program } = this;
        const loc = gl.getUniformLocation(program, name);
        return () => {
            gl.uniform3fv(loc, value);
        };
    }
    setUniform4fv(name, value) {
        const { gl, program } = this;
        const loc = gl.getUniformLocation(program, name);
        return (nextValue) => {
            gl.uniform4fv(loc, nextValue ?? value);
        };
    }
    setUniform1f(name, value) {
        const { gl, program } = this;
        const loc = gl.getUniformLocation(program, name);
        return (nextValue) => {
            gl.uniform1f(loc, nextValue ?? value);
        };
    }
    setUniformMatrix4fv(name, mat) {
        const { gl, program } = this;
        const loc = gl.getUniformLocation(program, name);
        return () => {
            gl.uniformMatrix4fv(loc, false, mat);
        };
    }
    setBody(body) {
        this.body = body;
    }
    setUniformLMVP(needLocal = true, needModel = true) {
        const { cam, body } = this;
        let l = null, m = null;
        if (needLocal) {
            l = this.setUniformMatrix4fv("local", body.localMat);
        }
        if (needModel) {
            m = this.setUniformMatrix4fv("model", body.modelMat);
        }
        this.setUniformMatrix4fv("view", cam.viewMat)();
        this.setUniformMatrix4fv("projection", cam.projectionMat)();
        return () => {
            l && l();
            m && m();
        };
    }
}
