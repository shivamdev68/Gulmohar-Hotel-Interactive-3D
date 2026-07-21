import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import loadingManager from './loadingManager.js';

/**
 * Provides one shared DRACO decoder loader for compressed glTF assets.
 */
class DracoLoader {
    static #instance;

    constructor() {
        if (DracoLoader.#instance) {
            return DracoLoader.#instance;
        }

        this.loader = new DRACOLoader(loadingManager.getManager());
        DracoLoader.#instance = this;
    }

    /**
     * Sets the directory containing the DRACO decoder files.
     * @param {string} decoderPath
     */
    setDecoderPath(decoderPath) {
        if (!decoderPath) {
            throw new Error('A DRACO decoder path is required.');
        }

        this.loader.setDecoderPath(decoderPath);
    }

    /**
     * Returns the shared Three.js DRACOLoader instance.
     * @returns {DRACOLoader}
     */
    getLoader() {
        return this.loader;
    }
}

export { DracoLoader };
export default new DracoLoader();
