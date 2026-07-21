import NavigationMode from './navigationMode.js';

/**
 * Navigation mode backed by the application's existing OrbitControls wrapper.
 */
export default class OrbitNavigation extends NavigationMode {
    /**
     * @param {import('three').Camera} camera
     * @param {import('three').WebGLRenderer} renderer
     * @param {{ update: () => void, dispose: () => void, getControls: () => { enabled: boolean } }} controls
     */
    constructor(camera, renderer, controls) {
        super(camera, renderer);
        if (!controls) {
            throw new Error('OrbitNavigation requires the existing camera controls.');
        }

        this.controls = controls;
    }

    /**
     * Initializes the wrapped controls for lifecycle management.
     */
    initialize() {
        this.controls.getControls().enabled = false;
    }

    /**
     * Enables the existing OrbitControls instance.
     */
    enable() {
        this.controls.getControls().enabled = true;
        this.isEnabled = true;
    }

    /**
     * Disables the existing OrbitControls instance.
     */
    disable() {
        this.controls.getControls().enabled = false;
        this.isEnabled = false;
    }

    /**
     * Delegates update work to the existing controls wrapper.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        void deltaTime;
        if (this.isEnabled) {
            this.controls.update();
        }
    }

    /**
     * Disposes the existing OrbitControls instance.
     */
    dispose() {
        this.controls.dispose();
        this.isEnabled = false;
    }
}
