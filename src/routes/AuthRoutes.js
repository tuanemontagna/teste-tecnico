import authController from "../controllers/AuthController.js";

export default (app) => {
    app.post('/auth/login', authController.login);
}