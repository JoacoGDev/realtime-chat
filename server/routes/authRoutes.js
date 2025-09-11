import express from 'express';
import { registerUser, authenticateUser } from '../users.js';
import { validateRegister, validateLogin, validate } from '../validators/authValidators.js';
import { generateToken } from '../config/jwt.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

//Registro

router.post('/register', authLimiter ,validateRegister, validate, async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await registerUser(username, password);

        const token = generateToken(user);

        res.status(201).json({ user: {id: user.id, username: user.username}, token });
    } catch (err) {
        if (err.message === 'El nombre de usuario ya existe') {
            return res.status(409 ).json({ error: err.message });
        }

        console.log("Error en el registro:", err);  
        res.status(500).json({ error: 'Error interno del servidor' });
    }
})

//Login

router.post('/login', authLimiter, validateLogin, validate, async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await authenticateUser(username, password);
        if(!user){
            return res.status(401).json({error: "Credenciales inválidas"});
        }

        //Generar token JWT en login
        const token = generateToken(user);

        res.json({user: {id: user.id, username: user.username}, token});
    } catch( err) {
        console.log("Error en el login:", err); 
        res.status(500).json({ error: 'Error interno del servidor' });
    }

});

export default router;