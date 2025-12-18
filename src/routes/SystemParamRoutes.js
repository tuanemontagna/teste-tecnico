import systemParamController from "../controllers/SystemParamController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/authAdmin.js";

export default (app) => {
    app.get('/system-param', verifyToken, systemParamController.get);
    app.get('/system-param/:id', verifyToken, systemParamController.get);
    app.post('/system-param', verifyToken, isAdmin, systemParamController.persist);
    app.patch('/system-param/:id', verifyToken, isAdmin, systemParamController.persist);
    app.delete('/system-param/:id', verifyToken, isAdmin, systemParamController.destroy);
}