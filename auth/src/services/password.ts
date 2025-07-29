import {scrypt, randomBytes} from 'crypto'; //scrypt is a Node.js built-in module for password hashing that is callback-based
import {promisify} from 'util'; // promisify is a utility function that converts callback-based functions to return promises
const scryptAsync = promisify(scrypt); // Convert scrypt to return a promise
export class Password{
    static async toHash(password: string) {
        const salt = randomBytes(8).toString('hex');
        const buf = (await scryptAsync(password, salt, 64)) as Buffer; 
        return `${buf.toString('hex')}.${salt}`;
    }
    
    static async compare(storedPassword: string, suppliedPassword: string) {
        const [hashedPassword, salt] = storedPassword.split('.');
        const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer; 
        return buf.toString('hex') === hashedPassword;
    }
}