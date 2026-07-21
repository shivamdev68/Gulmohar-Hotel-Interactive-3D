import { clone as cloneSkinnedModel } from 'three/examples/jsm/utils/SkeletonUtils.js';
import assetManager from '../loaders/assetManager.js';

/**
 * Owns the lifecycle of one hotel model instance.
 * Loading, scene attachment, transforms, shadow configuration, and cleanup are
 * kept separate from engine and UI concerns.
 */
export default class HotelManager {
    /**
     * @param {{ modelAssets?: { loadModel: (name: string, path: string) => Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF> } }} dependencies
     */
    constructor({ modelAssets = assetManager } = {}) {
        this.modelAssets = modelAssets;
        this.model = null;
        this.scene = null;
        this.assetName = null;
        this.assetPath = null;
        this.loadingPromise = null;
        this.loadingRequest = null;
    }

    /**
     * Loads a hotel model through AssetManager and creates a manager-owned instance.
     * Repeated calls for the same asset return the existing or in-flight model.
     * @param {string} name
     * @param {string} path
     * @returns {Promise<import('three').Object3D>}
     */
    async load(name, path) {
        this.#validateAssetRequest(name, path);

        if (this.model) {
            if (this.assetName === name && this.assetPath === path) {
                return this.model;
            }
            throw new Error('A hotel model is already loaded. Dispose it before loading another model.');
        }

        if (this.loadingPromise) {
            if (this.loadingRequest.name === name && this.loadingRequest.path === path) {
                return this.loadingPromise;
            }
            throw new Error('A different hotel model is already loading.');
        }

        this.loadingRequest = { name, path };
        this.loadingPromise = this.modelAssets.loadModel(name, path)
            .then((gltf) => {
                if (!gltf?.scene) {
                    throw new Error(`Model "${name}" does not contain a scene.`);
                }

                this.model = cloneSkinnedModel(gltf.scene);
                this.#makeResourcesInstanceOwned();
                this.#configureShadows();
                this.assetName = name;
                this.assetPath = path;
                return this.model;
            })
            .finally(() => {
                this.loadingPromise = null;
                this.loadingRequest = null;
            });

        return this.loadingPromise;
    }

    /**
     * Adds the loaded hotel instance to a Three.js scene.
     * @param {{ add: (object: import('three').Object3D) => void, remove: (object: import('three').Object3D) => void }} scene
     */
    addToScene(scene) {
        const model = this.#requireModel();
        if (!scene || typeof scene.add !== 'function' || typeof scene.remove !== 'function') {
            throw new TypeError('A Three.js scene with add and remove methods is required.');
        }

        if (this.scene && this.scene !== scene) {
            this.scene.remove(model);
        }

        scene.add(model);
        this.scene = scene;
    }

    /**
     * Removes the loaded hotel instance from its current scene.
     */
    removeFromScene() {
        const model = this.#requireModel();
        if (this.scene) {
            this.scene.remove(model);
            this.scene = null;
        }
    }

    /**
     * Sets the hotel's world position.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setPosition(x, y, z) {
        this.#validateFiniteValues('Position', x, y, z);
        this.#requireModel().position.set(x, y, z);
    }

    /**
     * Sets the hotel's Euler rotation in radians.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    setRotation(x, y, z) {
        this.#validateFiniteValues('Rotation', x, y, z);
        this.#requireModel().rotation.set(x, y, z);
    }

    /**
     * Sets a uniform, positive scale for the hotel.
     * @param {number} scale
     */
    setScale(scale) {
        if (!Number.isFinite(scale) || scale <= 0) {
            throw new RangeError('Scale must be a positive finite number.');
        }

        this.#requireModel().scale.setScalar(scale);
    }

    /**
     * Changes the hotel's visibility without removing it from the scene.
     * @param {boolean} visible
     */
    setVisible(visible) {
        if (typeof visible !== 'boolean') {
            throw new TypeError('Visibility must be a boolean.');
        }

        this.#requireModel().visible = visible;
    }

    /**
     * Returns the manager-owned hotel object.
     * @returns {import('three').Object3D}
     */
    getObject() {
        return this.#requireModel();
    }

    /**
     * Indicates whether a hotel model has completed loading.
     * @returns {boolean}
     */
    isLoaded() {
        return this.model !== null;
    }

    /**
     * Removes the hotel from the scene and disposes resources owned by this instance.
     * This operation is safe to call more than once.
     */
    dispose() {
        if (!this.model) {
            return;
        }

        this.removeFromScene();

        const disposedGeometries = new Set();
        const disposedMaterials = new Set();
        this.model.traverse((object) => {
            if (!object.isMesh) {
                return;
            }

            if (!disposedGeometries.has(object.geometry)) {
                object.geometry.dispose();
                disposedGeometries.add(object.geometry);
            }

            this.#disposeMaterials(object.material, disposedMaterials);
        });

        this.model = null;
        this.assetName = null;
        this.assetPath = null;
    }

    /**
     * Configures every mesh to participate in shadow rendering.
     */
    #configureShadows() {
        this.model.traverse((object) => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });
    }

    /**
     * Clones mesh resources so disposing this instance does not invalidate AssetManager's cache.
     */
    #makeResourcesInstanceOwned() {
        this.model.traverse((object) => {
            if (!object.isMesh) {
                return;
            }

            object.geometry = object.geometry.clone();
            object.material = Array.isArray(object.material)
                ? object.material.map((material) => material.clone())
                : object.material.clone();
        });
    }

    /**
     * @param {import('three').Material | import('three').Material[]} materials
     * @param {Set<import('three').Material>} disposedMaterials
     */
    #disposeMaterials(materials, disposedMaterials) {
        const materialList = Array.isArray(materials) ? materials : [materials];
        materialList.forEach((material) => {
            if (!disposedMaterials.has(material)) {
                material.dispose();
                disposedMaterials.add(material);
            }
        });
    }

    /**
     * @returns {import('three').Object3D}
     */
    #requireModel() {
        if (!this.model) {
            throw new Error('No hotel model is loaded. Call load() before this operation.');
        }

        return this.model;
    }

    /**
     * @param {string} name
     * @param {string} path
     */
    #validateAssetRequest(name, path) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new TypeError('Hotel model name must be a non-empty string.');
        }
        if (typeof path !== 'string' || path.trim() === '') {
            throw new TypeError('Hotel model path must be a non-empty string.');
        }
    }

    /**
     * @param {string} valueName
     * @param {...number} values
     */
    #validateFiniteValues(valueName, ...values) {
        if (!values.every(Number.isFinite)) {
            throw new TypeError(`${valueName} values must be finite numbers.`);
        }
    }
}
