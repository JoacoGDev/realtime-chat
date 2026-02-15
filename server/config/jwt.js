import jwt from 'jsonwebtoken';

export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET,
    options: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        algorithm: 'HS256', 
        issuer: 'realtime-chat', 
        audience: 'chat-users', 
    }
};

// Función centralizada para generar tokens
export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            // Agregar timestamp de creación
            iat: Math.floor(Date.now() / 1000),
        },
        JWT_CONFIG.secret,
        JWT_CONFIG.options
    );
};

// Función centralizada para verificar tokens
export const verifyToken = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_CONFIG.secret, {
            algorithms: [JWT_CONFIG.options.algorithm],
            issuer: JWT_CONFIG.options.issuer,
            audience: JWT_CONFIG.options.audience,
        });

        // Verificar si el token ha expirado
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            throw new Error('Token has expired');
        }

        return decoded;
    } catch (error) {
        throw new Error(error.message || 'Invalid token');
    }
};

// Middleware para Express
export const authenticateJWT = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const decoded = await verifyToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: error.message });
    }
};
