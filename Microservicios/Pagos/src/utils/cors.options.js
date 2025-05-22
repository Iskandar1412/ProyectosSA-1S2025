// const allowedOrigins = ['http://localhost:5173', 'http://localhost:4000', 'http://192.168.0.9:5173', 'http://192.168.0.19:5173', 'http://192.168.0.19:4000'];
// const allowedOrigins = 'http://localhost:5173,http://192.168.0.9:5173,http://192.168.0.19:5173

const corsOptions = {
    origin: true, // Permitir cualquier origen
    credentials: true,
    methods: 'GET,HEAD,PUT,POST,PATCH,DELETE',
    allowedHeaders: 'Content-Type,Authorization,refresh,authorization'
};

module.exports = corsOptions;