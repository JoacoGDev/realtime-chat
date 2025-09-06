import express from 'express';
import { registerUser, authenticateUser } from './users.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SIGNATURE = process.env.JWT_SECRET || "my_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ||'1h';

//Registro

router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await registerUser(username, password);

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            },
            JWT_SIGNATURE,
            {expiresIn: JWT_EXPIRES_IN}
        );

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

router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await authenticateUser(username, password);
        if(!user){
            return res.status(401).json({error: "Credenciales inválidas"});
        }

        //Generar token JWT en login
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username
            }, JWT_SIGNATURE,
            {expiresIn: JWT_EXPIRES_IN}
        );  

        res.json({user: {id: user.id, username: user.username}, token});
    } catch( err) {
        console.log("Error en el login:", err); 
        res.status(500).json({ error: 'Error interno del servidor' });
    }

});

export default router;