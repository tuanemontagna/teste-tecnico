import genreController from "../controllers/GenreController.js";

export default (app) => {
    app.get('/genre', genreController.get);
    app.get('/genre/:id', genreController.get);
    app.post('/genre', genreController.persist);
    app.patch('/genre/:id', genreController.persist);
    app.delete('/genre/:id', genreController.destroy);
}