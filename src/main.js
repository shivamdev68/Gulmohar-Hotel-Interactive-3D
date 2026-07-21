import './style.css'

import Engine from './core/engine.js';
import HotelManager from './hotel/hotelManager.js';

const app = document.querySelector('#app');
const engine = new Engine(app);
const hotelManager = new HotelManager();

engine.start();

async function loadHotel() {
    const { model, transform } = engine.settings.hotel;

    try {
        await hotelManager.load(model.name, model.path);
        hotelManager.setPosition(
            transform.position.x,
            transform.position.y,
            transform.position.z,
        );
        hotelManager.setRotation(
            transform.rotation.x,
            transform.rotation.y,
            transform.rotation.z,
        );
        hotelManager.setScale(transform.scale);
        hotelManager.addToScene(engine.scene.getScene());
        engine.collision.setWorld(hotelManager.getObject());
    } catch (error) {
        console.error(`Unable to load hotel model from "${model.path}". The scene will continue without it.`, error);
    }
}

void loadHotel();
