import userController from "../controllers/UserController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/authAdmin.js";

export default (app) => {
    app.post('/users', userController.createLoanUser);
    app.post('/admin/users', verifyToken, isAdmin, userController.createAdmin);
    app.get('/users', verifyToken, isAdmin, userController.get);
    app.get('/users/:id', verifyToken, userController.get);
    app.patch('/users/:id', verifyToken, isAdmin, userController.persist);
    app.delete('/users/:id', verifyToken, isAdmin, userController.destroy);
}