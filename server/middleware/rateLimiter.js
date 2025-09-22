import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 15, // 15 intentos
    message: {
        status: 'error',
        message: 'Demasiados intentos. Por favor, espere 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});


