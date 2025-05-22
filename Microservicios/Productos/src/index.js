require('./models');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const categoriaRoutes = require('./routes/categorias.router')
const marcaRoutes = require('./routes/marcas.router')
const productoRoutes = require('./routes/productos.router')
const imagenRoutes = require('./routes/imagenes.router')
const promocionRoutes = require('./routes/promociones.router')
const errorHandler  = require('./middleware/error.handler');
const corsOptions  = require('./utils/cors.options');

const app = express();

app.use(cors(corsOptions));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    next();
});

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/api', categoriaRoutes);
app.use('/api', marcaRoutes);
app.use('/api', productoRoutes);
app.use('/api', imagenRoutes);
app.use('/api', promocionRoutes);

app.use(errorHandler);

module.exports = app;