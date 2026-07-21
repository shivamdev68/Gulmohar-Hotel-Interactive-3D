import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

/**
 * Centralizes browser input state for navigation modes.
 * Navigation code consumes this class instead of registering DOM event listeners.
 */
export default class InputManager {
    /**
     * @param {HTMLElement} domElement
     */
    constructor(domElement) {
        if (!domElement?.ownerDocument) {
            throw new TypeError('InputManager requires a DOM element.');
        }

        this.domElement = domElement;
        this.document = domElement.ownerDocument;
        this.window = this.document.defaultView;
        this.pressedKeys = new Set();
        this.mouseDelta = { x: 0, y: 0 };
        this.isPointerLocked = false;
        this.acceptsPointerLock = false;
        this.controls = null;
        this.isInitialized = false;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    /**
     * Starts tracking keyboard, mouse, click, and pointer-lock state.
     */
    initialize() {
        if (this.isInitialized) {
            return;
        }

        this.window.addEventListener('keydown', this.handleKeyDown);
        this.window.addEventListener('keyup', this.handleKeyUp);
        this.document.addEventListener('mousemove', this.handleMouseMove);
        this.document.addEventListener('pointerlockchange', this.handlePointerLockChange);
        this.domElement.addEventListener('click', this.handleClick);
        this.isInitialized = true;
    }

    /**
     * Creates the PointerLockControls instance used for camera look.
     * @param {import('three').Camera} camera
     * @param {number} lookSensitivity
     * @returns {PointerLockControls}
     */
    createPointerLockControls(camera, lookSensitivity) {
        if (!Number.isFinite(lookSensitivity) || lookSensitivity <= 0) {
            throw new RangeError('Look sensitivity must be a positive finite number.');
        }

        if (this.controls) {
            if (this.controls.camera !== camera) {
                throw new Error('InputManager already owns pointer-lock controls for another camera.');
            }
            return this.controls;
        }

        this.controls = new PointerLockControls(camera, this.domElement);
        this.controls.pointerSpeed = lookSensitivity;
        return this.controls;
    }

    /**
     * Prepares PointerLockControls without exposing DOM interaction to navigation modes.
     * @param {import('three').Camera} camera
     * @param {number} lookSensitivity
     */
    configurePointerLockControls(camera, lookSensitivity) {
        this.createPointerLockControls(camera, lookSensitivity);
    }

    /**
     * Allows or prevents user-click pointer-lock requests.
     * @param {boolean} enabled
     */
    setPointerLockEnabled(enabled) {
        if (typeof enabled !== 'boolean') {
            throw new TypeError('Pointer-lock state must be a boolean.');
        }

        this.acceptsPointerLock = enabled;
        if (!enabled && this.isPointerLocked) {
            this.controls?.unlock();
        }
    }

    /**
     * Returns normalized keyboard intent for horizontal movement.
     * @returns {{ forward: number, right: number, sprint: boolean }}
     */
    getMovementIntent() {
        return {
            forward: Number(this.#isPressed('KeyW')) - Number(this.#isPressed('KeyS')),
            right: Number(this.#isPressed('KeyD')) - Number(this.#isPressed('KeyA')),
            sprint: this.#isPressed('ShiftLeft') || this.#isPressed('ShiftRight'),
        };
    }

    /**
     * Moves the camera forward relative to its current horizontal direction.
     * @param {number} distance
     */
    moveForward(distance) {
        this.#validateDistance(distance);
        this.controls?.moveForward(distance);
    }

    /**
     * Moves the camera right relative to its current horizontal direction.
     * @param {number} distance
     */
    moveRight(distance) {
        this.#validateDistance(distance);
        this.controls?.moveRight(distance);
    }

    /**
     * Returns mouse movement accumulated since the last read.
     * @returns {{ x: number, y: number }}
     */
    consumeMouseDelta() {
        const delta = { ...this.mouseDelta };
        this.mouseDelta.x = 0;
        this.mouseDelta.y = 0;
        return delta;
    }

    /**
     * Stops input tracking and releases PointerLockControls resources.
     */
    dispose() {
        if (this.isPointerLocked) {
            this.controls?.unlock();
        }

        if (this.isInitialized) {
            this.window.removeEventListener('keydown', this.handleKeyDown);
            this.window.removeEventListener('keyup', this.handleKeyUp);
            this.document.removeEventListener('mousemove', this.handleMouseMove);
            this.document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
            this.domElement.removeEventListener('click', this.handleClick);
        }

        this.controls?.dispose();
        this.controls = null;
        this.pressedKeys.clear();
        this.mouseDelta = { x: 0, y: 0 };
        this.isPointerLocked = false;
        this.acceptsPointerLock = false;
        this.isInitialized = false;
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleKeyDown(event) {
        this.pressedKeys.add(event.code);
    }

    /**
     * @param {KeyboardEvent} event
     */
    handleKeyUp(event) {
        this.pressedKeys.delete(event.code);
    }

    /**
     * @param {MouseEvent} event
     */
    handleMouseMove(event) {
        if (this.isPointerLocked) {
            this.mouseDelta.x += event.movementX;
            this.mouseDelta.y += event.movementY;
        }
    }

    /**
     * Synchronizes pointer-lock state after a browser lock or unlock event.
     */
    handlePointerLockChange() {
        this.isPointerLocked = this.document.pointerLockElement === this.domElement;
        if (!this.isPointerLocked) {
            this.mouseDelta = { x: 0, y: 0 };
        }
    }

    /**
     * Requests pointer lock only when the active navigation mode permits it.
     */
    handleClick() {
        if (this.acceptsPointerLock && !this.isPointerLocked) {
            this.controls?.lock();
        }
    }

    /**
     * @param {string} code
     * @returns {boolean}
     */
    #isPressed(code) {
        return this.pressedKeys.has(code);
    }

    /**
     * @param {number} distance
     */
    #validateDistance(distance) {
        if (!Number.isFinite(distance)) {
            throw new TypeError('Movement distance must be a finite number.');
        }
    }
}
