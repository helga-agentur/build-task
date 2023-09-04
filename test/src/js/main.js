// Use file extension here because it's not standard
import include from './include.mjs';
import PrivatePropClass from './PrivatePropClass.js';

console.log(include(5));

const privateProp = new PrivatePropClass();
console.log(privateProp.getPrivateField());

