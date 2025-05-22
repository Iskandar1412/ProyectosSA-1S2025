require('dotenv').config(); // npm i dotenv
const app = require('./src/index');
const port = 5200;

app.listen(port, () => {
    console.log(`Servidor Usuarios (puerto): ${port}`)
});
