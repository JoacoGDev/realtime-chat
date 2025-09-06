import bcrypt from 'bcrypt';
import {insertUser, findUserByUsername, findUsername} from './db.js';

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;

export async function registerUser(username, password) {

    //Validar que el username no exista
    const existingUser = await findUsername(username);
    if (existingUser) {
        throw new Error('El nombre de usuario ya existe');
    }
    //Hashear password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await insertUser(username, passwordHash);

    return user;
}


export async function authenticateUser(username, password) {
    const user = await findUserByUsername(username);

    if(!user){
        throw new Error('Credenciales inválidas');
    }
     
    const isValid = await bcrypt.compare(password, user.password_hash);
    if(!isValid){
        throw new Error('Credenciales inválidas');
    }

    return user;

}