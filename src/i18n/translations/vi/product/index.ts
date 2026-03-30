import detail from './detail.json';
import home from './home.json';
import list from './list.json';

const productMessages = { ...list, ...home, ...detail };

export default productMessages;
