import { Admins } from "./admin.entity";
import { Cart } from "./cart.entity";
import { CartItem } from "./cartItem.entity";
import { Categories } from "./categories.entity";
import { Customers } from "./customers.entity";
import { Favorites } from "./favorites.entity";
import { LevelCodes } from "./level-codes.entity";
import { OrderDetails } from "./order.details.entity";
import { Orders } from "./orders.entity";
import { Products } from "./products.entity";
import { Reviews } from "./reviews.entity";
import { SellerProduct } from "./seller.product.entity";
import { Sellers } from "./sellers.entity";
import { Users } from "./users.entity";


const entities = [Users,Products,Sellers,Reviews,Categories,Favorites,OrderDetails,Orders,Customers,Cart,CartItem,SellerProduct,Admins,LevelCodes];
export {Users,Products,Sellers,Reviews,Categories,Favorites,OrderDetails,Orders,Customers,Cart,CartItem,SellerProduct,Admins,LevelCodes };
export default entities;