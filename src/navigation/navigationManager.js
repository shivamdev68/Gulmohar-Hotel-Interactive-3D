/**
 * Coordinates registration, activation, and lifecycle transitions for navigation modes.
 */
export default class NavigationManager {
    /**
     * @param {import('three').Camera} camera
     * @param {import('three').WebGLRenderer} renderer
     */
    constructor(camera, renderer) {
        if (!camera || !renderer) {
            throw new Error('NavigationManager requires a camera and renderer.');
        }

        this.camera = camera;
        this.renderer = renderer;
        this.modes = new Map();
        this.initializedModes = new WeakSet();
        this.currentMode = null;
        this.currentModeName = null;
        this.transition = Promise.resolve();
    }

    /**
     * Registers a navigation mode for later activation.
     * @param {string} name
     * @param {{ initialize: () => void | Promise<void>, enable: () => void | Promise<void>, disable: () => void | Promise<void>, update: (deltaTime: number) => void, dispose: () => void | Promise<void> }} mode
     * @returns {NavigationManager}
     */
    register(name, mode) {
        this.#validateModeName(name);
        this.#validateMode(mode);

        if (this.modes.has(name)) {
            throw new Error(`Navigation mode "${name}" is already registered.`);
        }

        this.modes.set(name, mode);
        return this;
    }

    /**
     * Safely activates a registered mode after completing any pending mode transition.
     * @param {string} name
     * @returns {Promise<object>}
     */
    setMode(name) {
        this.#validateModeName(name);
        if (!this.modes.has(name)) {
            return Promise.reject(new Error(`Navigation mode "${name}" is not registered.`));
        }

        this.transition = this.transition
            .catch(() => undefined)
            .then(() => this.#activateMode(name));

        return this.transition;
    }

    /**
     * Updates the currently active mode.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        if (!Number.isFinite(deltaTime) || deltaTime < 0) {
            throw new RangeError('Navigation delta time must be a non-negative finite number.');
        }

        this.currentMode?.update(deltaTime);
    }

    /**
     * Returns the currently active navigation mode, if one is active.
     * @returns {object | null}
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Disables and disposes the active navigation mode.
     * @returns {Promise<void>}
     */
    dispose() {
        this.transition = this.transition
            .catch(() => undefined)
            .then(async () => {
                if (!this.currentMode) {
                    return;
                }

                await this.currentMode.disable();
                await this.currentMode.dispose();
                this.currentMode = null;
                this.currentModeName = null;
            });

        return this.transition;
    }

    /**
     * @param {string} name
     * @returns {Promise<object>}
     */
    async #activateMode(name) {
        if (this.currentModeName === name) {
            return this.currentMode;
        }

        const nextMode = this.modes.get(name);
        if (!this.initializedModes.has(nextMode)) {
            await nextMode.initialize();
            this.initializedModes.add(nextMode);
        }

        const previousMode = this.currentMode;
        if (previousMode) {
            await previousMode.disable();
        }

        try {
            await nextMode.enable();
        } catch (error) {
            if (previousMode) {
                await previousMode.enable();
            }
            throw error;
        }

        this.currentMode = nextMode;
        this.currentModeName = name;
        return nextMode;
    }

    /**
     * @param {string} name
     */
    #validateModeName(name) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('Navigation mode names must be non-empty strings.');
        }
    }

    /**
     * @param {object} mode
     */
    #validateMode(mode) {
        const lifecycleMethods = ['initialize', 'enable', 'disable', 'update', 'dispose'];
        const hasLifecycle = lifecycleMethods.every((method) => typeof mode?.[method] === 'function');
        if (!hasLifecycle) {
            throw new TypeError('Navigation modes must implement the full navigation lifecycle.');
        }
    }
}
