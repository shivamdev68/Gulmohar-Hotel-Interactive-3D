const Settings = {

    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: {
            x: 8,
            y: 6,
            z: 10
        }
    },

    renderer: {
        antialias: true,
        shadows: true,
        pixelRatio: Math.min(window.devicePixelRatio, 2)
    },

    world: {
        gridSize: 100,
        gridDivisions: 100,
        backgroundColor: 0xf5f5f5
    }

};

export default Settings;