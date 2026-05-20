import product from './product.json';
import order from './order.json';
import category from './category.json';

const adminMessages = { ...product, ...order, ...category };

export default adminMessages;
