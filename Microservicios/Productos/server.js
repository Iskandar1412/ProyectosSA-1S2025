require('dotenv').config(); // npm i dotenv
const app = require('./src/index');
const port = 5300;

app.listen(port, () => {
    console.log(`Servidor Productos (puerto): ${port}`)
});