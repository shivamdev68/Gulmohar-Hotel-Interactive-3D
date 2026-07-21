import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import dracoLoader from './dracoLoader.js';
import loadingManager from './loadingManager.js';

/**
 * Promise-based loader for .gltf and .glb assets.
 */
class GltfLoader {
    static #instance;

    constructor() {
        if (GltfLoader.#instance) {
            return GltfLoader.#instance;
        }

        this.loader = new GLTFLoader(loadingManager.getManager());
        this.loader.setDRACOLoader(dracoLoader.getLoader());
        GltfLoader.#instance = this;
    }

    /**
     * Loads a glTF or GLB asset.
     * @param {string} path
     * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
     */
    load(path) {
        if (!path) {
            return Promise.reject(new Error('A glTF asset path is required.'));
        }

        return new Promise((resolve, reject) => {
            this.loader.load(path, resolve, undefined, reject);
        });
    }
}

export { GltfLoader };
export default new GltfLoader();
