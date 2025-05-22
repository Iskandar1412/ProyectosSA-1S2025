require('dotenv').config(); // npm i dotenv
const app = require('./src/index');
const port = 5700;

app.listen(port, () => {
    console.log(`Servidor Devoluciones (puerto): ${port}`)
});
