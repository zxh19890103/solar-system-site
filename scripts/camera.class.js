import { Body } from "./body.class.js"
const { vec3 } = glMatrix;
export class Camera {
    constructor(aspectRatio) {
        this.lookTo = [0, 0, 0];
        this.upTo = [0, 1, 0];
        this.viewMat = glMatrix.mat4.create();
        this.projectionMat = glMatrix.mat4.create();
        this.aspectRatio = aspectRatio;
    }
    get far() {
        return vec3.distance(this.lookTo, this.coord);
    }
    get z() {
        return vec3.sub([0, 0, 0], this.lookTo, this.coord);
    }
    put(coord) {
        this.coord = glMatrix.vec3.clone(coord);
        return this;
    }
    up(up) {
        this.upTo = glMatrix.vec3.clone(up);
        return this;
    }
    see(to) {
        if (!this.coord)
            throw new Error("pls put the cam firstly.");
        this.lookTo = to instanceof Body ? glMatrix.vec3.clone(to.coordinates) : glMatrix.vec3.clone(to);
        this.setViewMat();
        return this;
    }
    rotateAboutZ(rad) {
        glMatrix.mat4.rotate(this.viewMat, this.viewMat, rad, this.z);
        return this;
    }
    setViewMat() {
        glMatrix.mat4.lookAt(this.viewMat, this.coord, this.lookTo, this.upTo);
        this.viewMat_t = glMatrix.mat4.create();
        glMatrix.mat4.invert(this.viewMat_t, this.viewMat);
    }
    perspective(fovy, near, far) {
        glMatrix.mat4.perspective(this.projectionMat, fovy, this.aspectRatio, near, far);
        return this;
    }
    /**
     * @param v V is the coordinates in camera space
     */
    offset(v) {
        const wc = this.toWorldSpace(v, true);
        vec3.add(this.lookTo, this.lookTo, wc);
        this.see(this.lookTo);
        return this;
    }
    /**
     * transforms a coordinates of world into camera space.
     */
    toCamSpace(coord) {
        return glMatrix.vec3.transformMat4([0, 0, 0], coord, this.viewMat);
    }
    toWorldSpace(coord, justRotation = false) {
        const v = glMatrix.vec3.transformMat4([0, 0, 0], coord, this.viewMat_t);
        if (justRotation) {
            glMatrix.vec3.sub(v, v, this.coord);
        }
        return v;
    }
}
