import profileController from "../controllers/profileController.js";

export default (app) => {
    app.get('/profile', profileController.get);
    app.get('/profile/:id', profileController.get);
    app.post('/profile', profileController.persist);
    app.patch('/profile/:id', profileController.persist);
    app.delete('/profile/:id', profileController.destroy);
}