import detail from './detail.json';
import home from './home.json';
import list from './list.json';
import specs from './specs.json';

const productMessages = { ...list, ...home, ...detail, ...specs };

export default productMessages;
