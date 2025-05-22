require('dotenv').config();
const app = require('./src/index');
const port = 5500;

app.listen(port, () => {
    console.log(`Servidor Chatbot (puerto): ${port}`)
});
