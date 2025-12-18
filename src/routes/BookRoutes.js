import bookController from "../controllers/BookController.js";
import { verifyToken} from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/authAdmin.js";

export default (app) => {
    app.get('/book', bookController.get);
    app.get('/book/:id', bookController.get);
    app.get('/book/:id/location', bookController.getLocation);
    app.post('/book', verifyToken, isAdmin, bookController.persist);
    app.patch('/book/:id', verifyToken, isAdmin, bookController.persist);
    app.delete('/book/:id', verifyToken, isAdmin, bookController.destroy);
}