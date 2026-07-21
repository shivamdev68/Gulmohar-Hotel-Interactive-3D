export default class SceneManager {
    constructor({
        renderer,
        scene,
        camera,
        navigation,
        clock
    }) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.navigation = navigation;
        this.clock = clock;
    }

    update() {
        const deltaTime = this.clock.getDelta();
        this.navigation.update(deltaTime);
        this.renderer.render(
            this.scene.getScene(),
            this.camera.getCamera()
        );
    }

    resize(width, height) {
        this.camera.resize(width, height);
        this.renderer.resize(width, height);
    }
}
