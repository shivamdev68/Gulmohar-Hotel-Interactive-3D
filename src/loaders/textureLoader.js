import * as THREE from 'three';
import loadingManager from './loadingManager.js';

/**
 * Promise-based loader for Three.js textures.
 * Asset caching is intentionally owned by AssetManager.
 */
class TextureLoader {
    static #instance;

    constructor() {
        if (TextureLoader.#instance) {
            return TextureLoader.#instance;
        }

        this.loader = new THREE.TextureLoader(loadingManager.getManager());
        TextureLoader.#instance = this;
    }

    /**
     * Loads a texture.
     * @param {string} path
     * @returns {Promise<THREE.Texture>}
     */
    load(path) {
        if (!path) {
            return Promise.reject(new Error('A texture asset path is required.'));
        }

        return new Promise((resolve, reject) => {
            this.loader.load(path, resolve, undefined, reject);
        });
    }
}

export { TextureLoader };
export default new TextureLoader();
