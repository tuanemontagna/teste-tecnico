import loanController from "../controllers/LoanController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/authAdmin.js";

export default (app) => {
    app.get('/loans', verifyToken, loanController.get); 
    app.get('/loans/:id', verifyToken, loanController.get);
    app.get('/loans/overdue', verifyToken, isAdmin, loanController.getOverdue);
    app.get('/loans/:id/fine', verifyToken, loanController.getFine);
    app.get('/loans/:id/rental', verifyToken, loanController.getRental);
    app.get('/loans/:id/preview', verifyToken, loanController.getPreview);
    app.get('/users/:id/loans', verifyToken, loanController.getByUser);
    app.post('/loans', verifyToken, loanController.persist);
    app.post('/loans/:id/return', verifyToken, isAdmin, loanController.returnBook);
    app.patch('/loans/:id/discount', verifyToken, isAdmin, loanController.applyFirstTimeDiscount);
    app.patch('/loans/:id', verifyToken, isAdmin, loanController.persist); 
    app.delete('/loans/:id', verifyToken, isAdmin, loanController.destroy);
}