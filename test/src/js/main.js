// Use file extension here because it's not standard
// eslint-disable-next-line
import include from './include.mjs';
import PrivatePropClass from './PrivatePropClass';

console.log(include(5));

const privateProp = new PrivatePropClass();
console.log(privateProp.getPrivateField());
