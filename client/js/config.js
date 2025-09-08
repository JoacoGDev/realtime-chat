// Config para manejar URLs según el entorno
const config = {
    development: {
        socketUrl: '' // URL vacía para conexión relativa al mismo dominio
    },
    production: {
        socketUrl: 'https://{TU-URL-DE-RAILWAY}.railway.app' // Se actualizará con la URL real de Railway
    }
};

// Determinar el entorno actual
const isProduction = window.location.hostname !== 'localhost';
const currentConfig = isProduction ? config.production : config.development;
