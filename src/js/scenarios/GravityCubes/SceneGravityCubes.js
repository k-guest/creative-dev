import * as THREE from 'three';
import Scene3D from "../../template/Scene3D";
import { Composite, Engine, Runner } from 'matter-js';
import { randomRange } from '../../Utils/MathUtils';
import GravityCube from './GravityCubes';
import Wall from './Wall';
import { clamp } from 'three/src/math/MathUtils.js';

const THICKNESS = 20;

export default class SceneGravityCubes extends Scene3D {
    constructor(id) {
        super(id);

        /** debug */
        this.params = {
            gScale: 1,
        };
        if (!!this.debugFolder) {
            this.debugFolder.add(this.params, "gScale", 0.5, 10, 0.1).onChange(() => {
                if (!!this.engine) this.engine.gravity.scale *= this.params.gScale;
            });
        }

        /** orthographic camera */
        this.camera = new THREE.OrthographicCamera(
            -this.width / 2,
            this.width / 2,
            this.height / 2,
            -this.height / 2,
            0.1,
            2000
        );
        this.camera.position.z = 1000;

        /** walls */
        this.wallRight = new Wall('blue');
        this.wallLeft = new Wall('green');
        this.wallBottom = new Wall('red');

        this.horizontalBarTop = new Wall('white');
        this.horizontalBarBottom = new Wall('white');

        this.add(this.wallRight);
        this.add(this.wallLeft);
        this.add(this.horizontalBarTop);
        this.add(this.horizontalBarBottom);

        /** cubes */
        this.cubes = [];
        const colors = ['red', 'yellow', 'blue'];
        for (let i = 0; i < 10; i++) {
            const cube_ = new GravityCube(50, colors[i % colors.length]);
            const x_ = randomRange(-this.width / 2, this.width / 2);
            const y_ = randomRange(-this.height / 2, this.height / 2);
            cube_.setPosition(x_, y_);

            this.add(cube_);
            this.cubes.push(cube_);
        }

        /** matter js */
        this.engine = Engine.create({ render: { visible: false } });
        this.engine.gravity.scale *= this.params.gScale;
        console.log(this.engine.gravity);
        this.bodies = [
            this.wallRight.body,
            this.wallLeft.body,
            this.horizontalBarTop.body,
            this.horizontalBarBottom.body,
            ...this.cubes.map(c => c.body),
        ];
        Composite.add(this.engine.world, this.bodies);
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);

        /** device orientation */
        this.globalContext.useDeviceOrientation = true;
        this.orientation = this.globalContext.orientation;

        /** resize */
        this.resize();
    }

    addCube(x, y) {
        const size = 50;
        const color = 'yellow';
        const newCube = new GravityCube(size, color);

        newCube.setPosition(x, y);

        this.add(newCube);

        Composite.add(this.engine.world, newCube.body);

        this.cubes.push(newCube);

        return newCube;
    }

    removeCube(cube) {
        /** dispose from memory */
        cube.geometry.dispose();
        cube.material.dispose();
        cube.removeFromParent();

        /** dispose from matter js */
        Composite.remove(this.engine.world, cube.body);

        /** dispose from scene */
        this.cubes = this.cubes.filter(c => c !== cube);
    }

    update() {
        this.cubes.forEach(c => {
            c.update();
        });
        super.update();
    }

    resize() {
        super.resize();

        this.camera.left = -this.width / 2;
        this.camera.right = this.width / 2;
        this.camera.top = this.height / 2;
        this.camera.bottom = -this.height / 2;

        if (!!this.wallRight) {
            this.wallRight.setPosition(this.width / 2, 0);
            this.wallRight.setSize(THICKNESS, this.height);

            this.wallLeft.setPosition(-this.width / 2, 0);
            this.wallLeft.setSize(THICKNESS, this.height);

            this.wallBottom.setPosition(0, -this.height / 2);
            this.wallBottom.setSize(this.width - THICKNESS, THICKNESS);

            this.horizontalBarTop.setPosition(-this.width / 4, this.height / 4);
            this.horizontalBarTop.setSize(this.width * 0.75, THICKNESS);

            this.horizontalBarBottom.setPosition(this.width / 4, -this.height / 4);
            this.horizontalBarBottom.setSize(this.width * 0.75, THICKNESS);
        }
    }

    onDeviceOrientation() {
        let gx_ = this.orientation.gamma / 90;
        let gy_ = this.orientation.beta / 90;
        gx_ = clamp(gx_, -1, 1);
        gy_ = clamp(gy_, -1, 1);

        /** update engine gravity */
        this.engine.gravity.x = gx_;
        this.engine.gravity.y = gy_;
    }
}