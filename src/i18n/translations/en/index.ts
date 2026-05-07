import common from './common.json';
import cartMessages from './cart.json';
import orderMessages from './order.json';
import authMessages from './auth';
import productMessages from './product';
import adminMessages from './admin';

const messages = {
	...common,
	...cartMessages,
	...orderMessages,
	auth: authMessages,
	product: productMessages,
	admin: adminMessages,
};

export default messages;
