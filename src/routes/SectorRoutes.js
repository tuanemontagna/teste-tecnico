import sectorController from "../controllers/SectorController.js";

export default (app) => {
    app.get('/sector', sectorController.get);
    app.get('/sector/:id', sectorController.get);
    app.post('/sector', sectorController.persist);
    app.patch('/sector/:id', sectorController.persist);
    app.delete('/sector/:id', sectorController.destroy);
}