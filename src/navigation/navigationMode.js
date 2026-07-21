/**
 * Base lifecycle contract for a navigation mode.
 * Concrete modes can override only the hooks they need.
 */
export default class NavigationMode {
    /**
     * @param {import('three').Camera} camera
     * @param {import('three').WebGLRenderer} renderer
     */
    constructor(camera, renderer) {
        this.camera = camera;
        this.renderer = renderer;
        this.isEnabled = false;
    }

    /**
     * Prepares mode-specific resources.
     * @returns {void | Promise<void>}
     */
    initialize() {}

    /**
     * Activates the mode.
     * @returns {void | Promise<void>}
     */
    enable() {
        this.isEnabled = true;
    }

    /**
     * Deactivates the mode.
     * @returns {void | Promise<void>}
     */
    disable() {
        this.isEnabled = false;
    }

    /**
     * Updates the mode for one rendered frame.
     * @param {number} deltaTime
     * @returns {void}
     */
    update(deltaTime) {
        void deltaTime;
    }

    /**
     * Releases resources owned by the mode.
     * @returns {void | Promise<void>}
     */
    dispose() {
        this.isEnabled = false;
    }
}
