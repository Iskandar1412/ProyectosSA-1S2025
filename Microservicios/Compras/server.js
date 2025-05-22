require('dotenv').config(); // npm i dotenv
const app = require('./src/index');
const port = 5100;

app.listen(port, () => {
    console.log(`Servidor Compras (puerto): ${port}`)
});
