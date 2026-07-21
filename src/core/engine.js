import Camera from '../camera/camera.js';
import Settings from '../config/settings.js';
import CameraControls from '../controls/orbitControls.js';
import InputManager from '../input/inputManager.js';
import Lights from '../lighting/lights.js';
import SceneManager from '../managers/sceneManager.js';
import {
    CollisionManager,
    FirstPersonNavigation,
    NavigationManager,
    OrbitNavigation,
} from '../navigation/index.js';
import Axes from '../world/axes.js';
import Grid from '../world/grid.js';
import Clock from './clock.js';
import Renderer from './renderer.js';
import Scene from './scene.js';

export default class Engine {
    constructor(container, settings = Settings) {
        if (!container) {
            throw new Error('Engine requires a container element.');
        }

        this.settings = settings;
        this.scene = new Scene(settings.world);
        this.camera = new Camera(settings.camera);
        this.renderer = new Renderer(settings.renderer, container);
        this.controls = new CameraControls(
            this.camera.getCamera(),
            this.renderer.getRenderer(),
            settings.controls,
        );
        this.navigation = new NavigationManager(
            this.camera.getCamera(),
            this.renderer.getRenderer(),
        );
        this.navigation.register(
            'orbit',
            new OrbitNavigation(
                this.camera.getCamera(),
                this.renderer.getRenderer(),
                this.controls,
            ),
        );
        this.input = new InputManager(this.renderer.getRenderer().domElement);
        this.collision = new CollisionManager(settings.collision);
        this.collision.setPlayer(this.camera.getCamera());
        this.navigation.register(
            'firstPerson',
            new FirstPersonNavigation(
                this.camera.getCamera(),
                this.renderer.getRenderer(),
                this.input,
                settings.navigation,
                this.collision,
            ),
        );
        void this.navigation.setMode('orbit');
        this.clock = new Clock();

        const threeScene = this.scene.getScene();
        this.lights = new Lights(threeScene, settings.lighting);
        this.grid = new Grid(threeScene, settings.world);
        this.axes = new Axes(threeScene, settings.helpers.axesSize);
        this.sceneManager = new SceneManager({
            renderer: this.renderer,
            scene: this.scene,
            camera: this.camera,
            navigation: this.navigation,
            clock: this.clock,
        });

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
    }

    start() {
        this.renderer.getRenderer().setAnimationLoop(() => this.sceneManager.update());
    }

    stop() {
        this.renderer.getRenderer().setAnimationLoop(null);
    }

    handleResize() {
        this.sceneManager.resize(window.innerWidth, window.innerHeight);
    }

    dispose() {
        this.stop();
        window.removeEventListener('resize', this.handleResize);
        void this.navigation.dispose();
        this.collision.dispose();
        this.renderer.dispose();
    }
}
