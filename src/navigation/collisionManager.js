import * as THREE from 'three';

/**
 * Performs reusable raycast-based wall and floor checks for a walking player.
 */
export default class CollisionManager {
    /**
     * @param {{ playerRadius: number, playerHeight: number, stepHeight: number, wallOffset: number, floorOffset: number }} settings
     */
    constructor(settings) {
        if (!settings) {
            throw new Error('CollisionManager requires collision settings.');
        }

        this.world = null;
        this.player = null;
        this.colliders = [];
        this.playerRadius = 0;
        this.playerHeight = 0;
        this.stepHeight = 0;
        this.wallOffset = 0;
        this.floorOffset = 0;
        this.wallRaycaster = new THREE.Raycaster();
        this.floorRaycaster = new THREE.Raycaster();
        this.wallIntersections = [];
        this.floorIntersections = [];
        this.movement = new THREE.Vector3();
        this.horizontalDirection = new THREE.Vector3();
        this.wallOrigin = new THREE.Vector3();
        this.floorOrigin = new THREE.Vector3();
        this.downDirection = new THREE.Vector3(0, -1, 0);

        this.setPlayerRadius(settings.playerRadius);
        this.setPlayerHeight(settings.playerHeight);
        this.setStepHeight(settings.stepHeight);
        this.#setOffsets(settings.wallOffset, settings.floorOffset);
    }

    /**
     * Sets the object hierarchy whose meshes are used as collision surfaces.
     * @param {import('three').Object3D} object3D
     */
    setWorld(object3D) {
        if (!object3D?.traverse) {
            throw new TypeError('Collision world must be a Three.js Object3D.');
        }

        this.world = object3D;
        this.colliders.length = 0;
        object3D.traverse((object) => {
            if (object.isMesh) {
                this.colliders.push(object);
            }
        });
    }

    /**
     * Sets the camera or Object3D representing the player.
     * @param {import('three').Object3D} camera
     */
    setPlayer(camera) {
        if (!camera?.position) {
            throw new TypeError('Collision player must be a Three.js Object3D.');
        }

        this.player = camera;
    }

    /**
     * Sets the horizontal collision radius around the player.
     * @param {number} radius
     */
    setPlayerRadius(radius) {
        this.playerRadius = this.#validatePositiveValue('Player radius', radius);
    }

    /**
     * Sets the height from floor level to the player's camera position.
     * @param {number} height
     */
    setPlayerHeight(height) {
        this.playerHeight = this.#validatePositiveValue('Player height', height);
    }

    /**
     * Sets the maximum upward floor change treated as a walkable step.
     * @param {number} height
     */
    setStepHeight(height) {
        this.stepHeight = this.#validatePositiveValue('Step height', height);
    }

    /**
     * Checks whether the player can move horizontally to a candidate position.
     * @param {import('three').Vector3} nextPosition
     * @returns {boolean}
     */
    canMove(nextPosition) {
        if (!nextPosition?.isVector3) {
            throw new TypeError('Next player position must be a Three.js Vector3.');
        }
        if (!this.player || this.colliders.length === 0) {
            return true;
        }

        this.movement.subVectors(nextPosition, this.player.position);
        this.movement.y = 0;
        const movementDistance = this.movement.length();
        if (movementDistance === 0) {
            return this.#hasWalkableFloor(nextPosition);
        }

        if (!this.#hasWalkableFloor(nextPosition)) {
            return false;
        }

        this.horizontalDirection.copy(this.movement).normalize();
        const wallCheckDistance = movementDistance + this.playerRadius + this.wallOffset;
        if (this.#hasWallCollision(
            this.player.position.y - this.playerHeight + this.stepHeight,
            wallCheckDistance,
        )
            || this.#hasWallCollision(this.player.position.y - (this.playerHeight / 2), wallCheckDistance)
            || this.#hasWallCollision(this.player.position.y, wallCheckDistance)) {
            return false;
        }

        return true;
    }

    /**
     * Keeps the player positioned on the nearest valid floor surface.
     */
    update() {
        if (!this.player || this.colliders.length === 0) {
            return;
        }

        const floor = this.#findFloor(this.player.position);
        if (!floor) {
            return;
        }

        const currentFloorY = this.player.position.y - this.playerHeight - this.floorOffset;
        if (floor.point.y - currentFloorY <= this.stepHeight) {
            this.player.position.y = floor.point.y + this.playerHeight + this.floorOffset;
        }
    }

    /**
     * Releases references and reusable collision data.
     */
    dispose() {
        this.world = null;
        this.player = null;
        this.colliders.length = 0;
        this.wallIntersections.length = 0;
        this.floorIntersections.length = 0;
    }

    /**
     * @param {number} height
     * @param {number} distance
     * @returns {boolean}
     */
    #hasWallCollision(height, distance) {
        this.wallOrigin.copy(this.player.position);
        this.wallOrigin.y = height;
        this.wallRaycaster.set(this.wallOrigin, this.horizontalDirection);
        this.wallRaycaster.near = 0;
        this.wallRaycaster.far = distance;
        this.wallIntersections.length = 0;
        this.wallRaycaster.intersectObjects(this.colliders, false, this.wallIntersections);
        return this.wallIntersections.length > 0;
    }

    /**
     * @param {import('three').Vector3} position
     * @returns {boolean}
     */
    #hasWalkableFloor(position) {
        const floor = this.#findFloor(position);
        if (!floor) {
            return false;
        }

        const currentFloorY = this.player.position.y - this.playerHeight - this.floorOffset;
        return floor.point.y - currentFloorY <= this.stepHeight;
    }

    /**
     * @param {import('three').Vector3} position
     * @returns {THREE.Intersection | undefined}
     */
    #findFloor(position) {
        this.floorOrigin.copy(position);
        this.floorOrigin.y += this.stepHeight;
        this.floorRaycaster.set(this.floorOrigin, this.downDirection);
        this.floorRaycaster.near = 0;
        this.floorRaycaster.far = this.playerHeight + this.stepHeight + this.floorOffset;
        this.floorIntersections.length = 0;
        this.floorRaycaster.intersectObjects(this.colliders, false, this.floorIntersections);
        return this.floorIntersections[0];
    }

    /**
     * @param {number} wallOffset
     * @param {number} floorOffset
     */
    #setOffsets(wallOffset, floorOffset) {
        this.wallOffset = this.#validatePositiveValue('Wall offset', wallOffset);
        this.floorOffset = this.#validatePositiveValue('Floor offset', floorOffset);
    }

    /**
     * @param {string} name
     * @param {number} value
     * @returns {number}
     */
    #validatePositiveValue(name, value) {
        if (!Number.isFinite(value) || value <= 0) {
            throw new RangeError(`${name} must be a positive finite number.`);
        }
        return value;
    }
}
