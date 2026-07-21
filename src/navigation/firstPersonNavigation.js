import NavigationMode from './navigationMode.js';
import * as THREE from 'three';

/**
 * First-person navigation with pointer-lock mouse look and free horizontal movement.
 */
export default class FirstPersonNavigation extends NavigationMode {
    /**
     * @param {import('three').Camera} camera
     * @param {import('three').WebGLRenderer} renderer
     * @param {import('../input/inputManager.js').default} inputManager
     * @param {{ moveSpeed: number, lookSensitivity: number, eyeHeight: number, sprintMultiplier: number }} settings
     * @param {{ canMove: (nextPosition: import('three').Vector3) => boolean, update: () => void }} collisionManager
     */
    constructor(camera, renderer, inputManager, settings, collisionManager) {
        super(camera, renderer);
        if (!inputManager || !settings || !collisionManager) {
            throw new Error('FirstPersonNavigation requires input, navigation settings, and collision management.');
        }

        this.inputManager = inputManager;
        this.settings = settings;
        this.collisionManager = collisionManager;
        this.isPointerLocked = false;
        this.direction = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.cameraRight = new THREE.Vector3();
        this.cameraForward = new THREE.Vector3();
        this.nextPosition = new THREE.Vector3();
    }

    /**
     * Prepares pointer-lock controls and begins input tracking.
     */
    initialize() {
        this.inputManager.initialize();
        this.inputManager.configurePointerLockControls(
            this.camera,
            this.settings.lookSensitivity,
        );
    }

    /**
     * Enables first-person mode. Pointer lock is requested only after a user click.
     */
    enable() {
        this.camera.position.y = this.settings.eyeHeight;
        this.inputManager.setPointerLockEnabled(true);
        this.isEnabled = true;
    }

    /**
     * Disables first-person movement and exits pointer lock when active.
     */
    disable() {
        this.inputManager.setPointerLockEnabled(false);
        this.isPointerLocked = false;
        this.#resetMovement();
        this.isEnabled = false;
    }

    /**
     * Applies keyboard movement relative to the camera's facing direction.
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.isPointerLocked = this.inputManager.isPointerLocked;
        if (!this.isEnabled || !this.isPointerLocked) {
            this.#resetMovement();
            return;
        }

        const { forward, right, sprint } = this.inputManager.getMovementIntent();
        this.camera.updateMatrix();
        this.cameraRight.setFromMatrixColumn(this.camera.matrix, 0).normalize();
        this.cameraForward.crossVectors(this.camera.up, this.cameraRight).normalize();
        this.direction.set(0, 0, 0);
        this.direction.addScaledVector(this.cameraRight, right);
        this.direction.addScaledVector(this.cameraForward, forward).normalize();

        const movementSpeed = this.settings.moveSpeed
            * (sprint ? this.settings.sprintMultiplier : 1);
        this.velocity.copy(this.direction).multiplyScalar(movementSpeed);

        this.nextPosition.copy(this.camera.position).addScaledVector(this.velocity, deltaTime);
        if (this.collisionManager.canMove(this.nextPosition)) {
            this.camera.position.copy(this.nextPosition);
        }
        this.collisionManager.update();
    }

    /**
     * Releases pointer-lock controls and input resources.
     */
    dispose() {
        this.disable();
        this.inputManager.dispose();
        this.isPointerLocked = false;
        this.#resetMovement();
        this.isEnabled = false;
    }

    /**
     * Clears movement state when navigation is inactive or pointer lock is released.
     */
    #resetMovement() {
        this.direction.set(0, 0, 0);
        this.velocity.set(0, 0, 0);
    }
}
