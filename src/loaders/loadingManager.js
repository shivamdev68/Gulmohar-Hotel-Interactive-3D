import * as THREE from 'three';

/**
 * Shared bridge between Three.js loading events and application-level callbacks.
 *
 * Import the default instance to use the single LoadingManager for the application.
 */
class AssetLoadingManager {
    static #instance;

    constructor() {
        if (AssetLoadingManager.#instance) {
            return AssetLoadingManager.#instance;
        }

        this.manager = new THREE.LoadingManager();
        this.callbacks = {
            start: new Set(),
            progress: new Set(),
            complete: new Set(),
            error: new Set(),
        };

        this.manager.onStart = (url, itemsLoaded, itemsTotal) => {
            this.#emit('start', url, itemsLoaded, itemsTotal);
        };
        this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
            this.#emit('progress', url, itemsLoaded, itemsTotal);
        };
        this.manager.onLoad = () => {
            this.#emit('complete');
        };
        this.manager.onError = (url) => {
            this.#emit('error', url);
        };

        AssetLoadingManager.#instance = this;
    }

    /**
     * Registers a callback for the beginning of a loading batch.
     * @param {(url: string, itemsLoaded: number, itemsTotal: number) => void} callback
     * @returns {() => void} Function that unregisters the callback.
     */
    onStart(callback) {
        return this.#register('start', callback);
    }

    /**
     * Registers a callback for loading progress.
     * @param {(url: string, itemsLoaded: number, itemsTotal: number) => void} callback
     * @returns {() => void} Function that unregisters the callback.
     */
    onProgress(callback) {
        return this.#register('progress', callback);
    }

    /**
     * Registers a callback for completion of a loading batch.
     * @param {() => void} callback
     * @returns {() => void} Function that unregisters the callback.
     */
    onComplete(callback) {
        return this.#register('complete', callback);
    }

    /**
     * Registers a callback for a failed resource request.
     * @param {(url: string) => void} callback
     * @returns {() => void} Function that unregisters the callback.
     */
    onError(callback) {
        return this.#register('error', callback);
    }

    /**
     * Returns the shared Three.js LoadingManager instance.
     * @returns {THREE.LoadingManager}
     */
    getManager() {
        return this.manager;
    }

    /**
     * @param {'start' | 'progress' | 'complete' | 'error'} eventName
     * @param {Function} callback
     * @returns {() => void}
     */
    #register(eventName, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError(`${eventName} callback must be a function.`);
        }

        this.callbacks[eventName].add(callback);
        return () => this.callbacks[eventName].delete(callback);
    }

    /**
     * @param {'start' | 'progress' | 'complete' | 'error'} eventName
     * @param {...unknown} args
     */
    #emit(eventName, ...args) {
        this.callbacks[eventName].forEach((callback) => callback(...args));
    }
}

export { AssetLoadingManager };
export default new AssetLoadingManager();
