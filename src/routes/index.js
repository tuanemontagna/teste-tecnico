import SystemParamRoutes from "./SystemParamRoutes.js";
import ProfileRoutes from "./ProfileRoutes.js";
import SectorRoutes from "./SectorRoutes.js";
import GenreRoutes from "./GenreRoutes.js";
import ShelfRoutes from "./ShelfRoutes.js";
import UserRoutes from "./UserRoutes.js";
import BookRoutes from "./BookRoutes.js";
import LoanRoutes from "./LoanRoutes.js";
import AuthRoutes from "./AuthRoutes.js";

export default (app) => {
    SystemParamRoutes(app);
    ProfileRoutes(app); 
    SectorRoutes(app);
    GenreRoutes(app);
    ShelfRoutes(app);
    UserRoutes(app);
    BookRoutes(app);
    LoanRoutes(app);
    AuthRoutes(app);
}