import common from './common.json';
import authMessages from './auth';
import productMessages from './product';
import adminMessages from './admin';

const messages = { ...common, auth: authMessages, product: productMessages, admin: adminMessages };

export default messages;
