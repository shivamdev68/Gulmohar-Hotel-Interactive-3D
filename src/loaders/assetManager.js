import gltfLoader from './gltfLoader.js';
import textureLoader from './textureLoader.js';

/**
 * Caches loaded assets and shares in-flight requests across callers.
 * It has no knowledge of project-specific asset paths or content.
 */
class AssetManager {
    constructor({ modelLoader = gltfLoader, textureLoader: textures = textureLoader } = {}) {
        this.modelLoader = modelLoader;
        this.textureLoader = textures;
        this.assets = new Map();
        this.sourceAssets = new Map();
        this.pendingLoads = new Map();
        this.pendingNames = new Map();
        this.cacheVersion = 0;
    }

    /**
     * Loads and caches a glTF/GLB asset under a stable name.
     * @param {string} name
     * @param {string} path
     * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
     */
    async loadModel(name, path) {
        return this.#load('model', name, path, (assetPath) => this.modelLoader.load(assetPath));
    }

    /**
     * Loads and caches a texture under a stable name.
     * @param {string} name
     * @param {string} path
     * @returns {Promise<import('three').Texture>}
     */
    async loadTexture(name, path) {
        return this.#load('texture', name, path, (assetPath) => this.textureLoader.load(assetPath));
    }

    /**
     * Gets an asset by name.
     * @param {string} name
     * @returns {unknown | undefined}
     */
    get(name) {
        return this.assets.get(name)?.value;
    }

    /**
     * Checks whether an asset has finished loading under a name.
     * @param {string} name
     * @returns {boolean}
     */
    has(name) {
        return this.assets.has(name);
    }

    /**
     * Removes a name-to-asset cache entry without disposing a potentially in-use asset.
     * @param {string} name
     * @returns {boolean}
     */
    remove(name) {
        return this.assets.delete(name);
    }

    /**
     * Clears all completed and in-flight cache entries.
     */
    clear() {
        this.cacheVersion += 1;
        this.assets.clear();
        this.sourceAssets.clear();
        this.pendingLoads.clear();
        this.pendingNames.clear();
    }

    /**
     * @param {'model' | 'texture'} type
     * @param {string} name
     * @param {string} path
     * @param {(path: string) => Promise<unknown>} load
     * @returns {Promise<unknown>}
     */
    async #load(type, name, path, load) {
        this.#validateRequest(name, path);

        const namedAsset = this.assets.get(name);
        if (namedAsset) {
            this.#assertAssetType(name, namedAsset.type, type);
            return namedAsset.value;
        }

        const pendingName = this.pendingNames.get(name);
        if (pendingName) {
            this.#assertAssetType(name, pendingName.type, type);
            return pendingName.promise;
        }

        const cacheVersion = this.cacheVersion;
        let namedPromise;
        namedPromise = this.#loadFromSource(type, path, load, cacheVersion)
            .then((asset) => {
                if (this.cacheVersion === cacheVersion) {
                    this.assets.set(name, { type, value: asset });
                }
                return asset;
            })
            .finally(() => {
                if (this.pendingNames.get(name)?.promise === namedPromise) {
                    this.pendingNames.delete(name);
                }
            });

        this.pendingNames.set(name, { type, promise: namedPromise });
        return namedPromise;
    }

    /**
     * Gets an asset from its source cache or starts one shared source request.
     * @param {'model' | 'texture'} type
     * @param {string} path
     * @param {(path: string) => Promise<unknown>} load
     * @param {number} cacheVersion
     * @returns {Promise<unknown>}
     */
    #loadFromSource(type, path, load, cacheVersion) {
        const sourceKey = `${type}:${path}`;
        const cachedAsset = this.sourceAssets.get(sourceKey);
        if (cachedAsset) {
            return Promise.resolve(cachedAsset);
        }

        const pendingLoad = this.pendingLoads.get(sourceKey);
        if (pendingLoad) {
            return pendingLoad;
        }

        let sourcePromise;
        sourcePromise = load(path)
            .then((asset) => {
                if (this.cacheVersion === cacheVersion) {
                    this.sourceAssets.set(sourceKey, asset);
                }
                return asset;
            })
            .finally(() => {
                if (this.pendingLoads.get(sourceKey) === sourcePromise) {
                    this.pendingLoads.delete(sourceKey);
                }
            });

        this.pendingLoads.set(sourceKey, sourcePromise);
        return sourcePromise;
    }

    /**
     * @param {string} name
     * @param {string} path
     */
    #validateRequest(name, path) {
        if (!name || !path) {
            throw new Error('Asset name and path are required.');
        }
    }

    /**
     * @param {string} name
     * @param {'model' | 'texture'} existingType
     * @param {'model' | 'texture'} requestedType
     */
    #assertAssetType(name, existingType, requestedType) {
        if (existingType !== requestedType) {
            throw new Error(`Asset name "${name}" is already used for a ${existingType}.`);
        }
    }
}

export { AssetManager };
export default new AssetManager();
