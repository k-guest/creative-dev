import SceneGravityCubes from "./js/scenarios/GravityCubes/SceneGravityCubes";
import SceneBouncingBubbles from "./js/scenarios/SceneBouncingBubbles";
import GlobalContext from "./js/template/GlobalContext";
import { askMotionAccess } from "./js/Utils/DeviceAccess";

/** Motion sensors authorization */
const btn = document.getElementById("btn-access");
btn.addEventListener("click", function () {
    askMotionAccess();
}, false);

/** Scenes */
const scene1 = new SceneBouncingBubbles("canvas-scene-1");
const scene2 = new SceneGravityCubes("canvas-scene-2");
const scene3 = new SceneBouncingBubbles("canvas-scene-3");

/** Main */
const globalContext = new GlobalContext();
const params = { test: 0 };
if (!!globalContext.debug.ui) {
    globalContext.debug.ui.add(params, "test", 0, 10);
}
const time = globalContext.time;

const update = () => {
    /** Example CSS */
    const scale_ = 1 + (Math.cos(5 * time.elapsed / 1000) / 2 + 0.5) / 20;
    btn.style.transform = `scale(${scale_}, 1)`;

    /** Check for bubbles and cubes out of bounds */
    const bubblesOutScene1Top = scene1.bubbles.filter(b => b.y < 0);
    const bubblesOutScene1Bottom = scene1.bubbles.filter(b => b.y > scene1.height);

    const cubesOutScene2Top = scene2.cubes.filter(c => c.position.y > scene2.height / 2);
    const cubesOutScene2Bottom = scene2.cubes.filter(c => c.position.y < -scene2.height / 2);

    const bubblesOutScene3Top = scene3.bubbles.filter(b => b.y < 0);
    const bubblesOutScene3Bottom = scene3.bubbles.filter(b => b.y > scene3.height);

    /** Remove entities outside their scenes */
    bubblesOutScene1Top.forEach(b => scene1.removeBubble(b));
    bubblesOutScene1Bottom.forEach(b => scene1.removeBubble(b));
    cubesOutScene2Top.forEach(c => scene2.removeCube(c));
    cubesOutScene2Bottom.forEach(c => scene2.removeCube(c));
    bubblesOutScene3Top.forEach(b => scene3.removeBubble(b));
    bubblesOutScene3Bottom.forEach(b => scene3.removeBubble(b));

    /** Add entities to corresponding scenes */
    bubblesOutScene1Top.forEach(bubble => {
        const newBubble = scene3.addBubble(bubble.x, scene3.height);
        newBubble.vx = bubble.vx;
        newBubble.vy = -Math.abs(bubble.vy);
    });
    bubblesOutScene1Bottom.forEach(bubble => {
        const newCube = scene2.addCube(bubble.x - scene2.width / 2, scene2.height / 2);
        newCube.vx = bubble.vx;
        newCube.vy = Math.abs(bubble.vy);
    });
    cubesOutScene2Top.forEach(cube => {
        const newBubble = scene1.addBubble(cube.position.x + scene1.width / 2, scene1.height);
        newBubble.vx = cube.vx;
        newBubble.vy = -Math.abs(cube.vy);
    });
    cubesOutScene2Bottom.forEach(cube => {
        const newBubble = scene3.addBubble(cube.position.x + scene3.width / 2, 0);
        newBubble.vy = Math.abs(newBubble.vy);
    });
    bubblesOutScene3Top.forEach(bubble => {
        const newCube = scene2.addCube(bubble.x - scene2.width / 2, -scene2.height / 2);
        newCube.vx = bubble.vx;
        newCube.vy = Math.abs(bubble.vy);
    });
    bubblesOutScene3Bottom.forEach(bubble => {
        const newBubble = scene1.addBubble(bubble.x, 0);
        newBubble.vx = bubble.vx;
        newBubble.vy = Math.abs(bubble.vy);
    });

    scene1.update();
    scene2.update();
    scene3.update();
};

time.on("update", update);
