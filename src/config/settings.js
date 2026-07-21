const Settings = Object.freeze({
    camera: Object.freeze({
        fov: 75,
        near: 0.1,
        far: 1000,
        position: Object.freeze({
            x: 8,
            y: 6,
            z: 10,
        }),
    }),

    renderer: Object.freeze({
        antialias: true,
        shadows: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2),
    }),

    world: Object.freeze({
        gridSize: 100,
        gridDivisions: 100,
        backgroundColor: 0xf5f5f5,
        fog: Object.freeze({
            near: 40,
            far: 150,
        }),
    }),

    controls: Object.freeze({
        dampingFactor: 0.05,
        minDistance: 3,
        maxDistance: 80,
        maxPolarAngle: Math.PI / 2,
    }),

    lighting: Object.freeze({
        ambientIntensity: 0.6,
        directionalIntensity: 2,
        directionalPosition: Object.freeze({ x: 10, y: 20, z: 10 }),
        shadowMapSize: 2048,
        shadowCameraNear: 0.5,
        shadowCameraFar: 100,
    }),

    helpers: Object.freeze({
        axesSize: 5,
    }),

    hotel: Object.freeze({
        model: Object.freeze({
            name: 'gulmohar-hotel',
            path: '/models/gulmohar.glb',
        }),
        transform: Object.freeze({
            position: Object.freeze({ x: 0, y: 0, z: 0 }),
            rotation: Object.freeze({ x: 0, y: 0, z: 0 }),
            scale: 1,
        }),
    }),

    navigation: Object.freeze({
        moveSpeed: 5,
        lookSensitivity: 1,
        eyeHeight: 1.6,
        sprintMultiplier: 1.75,
    }),

    collision: Object.freeze({
        playerRadius: 0.35,
        playerHeight: 1.6,
        stepHeight: 0.3,
        wallOffset: 0.05,
        floorOffset: 0.01,
    }),
});

export default Settings;
