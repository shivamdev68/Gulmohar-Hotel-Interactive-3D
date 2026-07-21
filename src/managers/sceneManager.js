export default class SceneManager {
    constructor({
        renderer,
        scene,
        camera,
        controls,
        clock
    }) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.controls = controls;
        this.clock = clock;
    }

    update() {
        // Delta time
        const delta = this.clock.getDelta();

        // Update controls
        this.controls.update(delta);

        // Render scene
        this.renderer.render(
            this.scene.getScene(),
            this.camera.getCamera()
        );
    }

    resize() {
        this.camera.resize();

        this.renderer.resize(
            this.camera.getCamera()
        );
    }
}