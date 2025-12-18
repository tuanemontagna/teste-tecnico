import shelfController from "../controllers/ShelfController.js";

export default (app) => {
    app.get('/shelf', shelfController.get);
    app.get('/shelf/:id', shelfController.get);
    app.post('/shelf', shelfController.persist);
    app.patch('/shelf/:id', shelfController.persist);
    app.delete('/shelf/:id', shelfController.destroy);
}