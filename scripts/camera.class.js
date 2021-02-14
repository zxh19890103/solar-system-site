import { Body } from "./body.class.js"
const { vec3 } = glMatrix;
export class Camera {
    constructor(aspectRatio) {
        this._towards = null;
        this.lookTo = [0, 0, 0];
        this.upTo = [0, 1, 0];
        this.viewMat = glMatrix.mat4.create();
        this.projectionMat = glMatrix.mat4.create();
        this.aspectRatio = aspectRatio;
    }
    get towards() {
        if (this._towards === null) {
            this._towards = vec3.normalize([0, 0, 0], vec3.sub([0, 0, 0], this.lookTo, this.coord));
        }
        return this._towards;
    }
    get far() {
        return vec3.distance(this.lookTo, this.coord);
    }
    put(coord) {
        this.coord = glMatrix.vec3.clone(coord);
        this._towards = null;
        return this;
    }
    up(up) {
        this.upTo = glMatrix.vec3.clone(up);
        return this;
    }
    moveBy(change, linear = false) {
        if (!this.coord)
            throw new Error("pls put the cam firstly.");
        vec3.add(this.coord, this.coord, change);
        this.setViewMat();
        if (linear)
            return;
        this._towards = null;
    }
    lookAt(to) {
        if (!this.coord)
            throw new Error("pls put the cam firstly.");
        this.lookTo = to instanceof Body ? to.coordinates : to;
        this._towards = null;
        this.setViewMat();
        return this;
    }
    setViewMat() {
        // glMatrix.mat4.translate(
        //   this.viewMat,
        //   this.viewMat,
        //   this.coord
        // )
        glMatrix.mat4.lookAt(this.viewMat, this.coord, this.lookTo, this.upTo);
    }
    rotate(rad) {
        glMatrix.mat4.rotateZ(this.viewMat, this.viewMat, rad);
    }
    adjust(fovy, near, far) {
        glMatrix.mat4.perspective(this.projectionMat, fovy, this.aspectRatio, near, far);
        return this;
    }
}
