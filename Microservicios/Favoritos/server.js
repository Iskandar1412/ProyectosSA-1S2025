require('dotenv').config(); // npm i dotenv
const app = require('./src/index');
const port = 5400;

app.listen(port, () => {
    console.log(`Servidor Favoritos (puerto): ${port}`)
});
