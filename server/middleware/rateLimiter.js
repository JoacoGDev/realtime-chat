import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: {
        status: 'error',
        message: 'Demasiados intentos. Por favor, espere 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 mensajes
    message: {
        status: 'error',
        message: 'Has enviado demasiados mensajes. Espera un momento.'
    }
});

module.exports = { authLimiter, chatLimiter };