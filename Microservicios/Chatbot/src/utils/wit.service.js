// Servicio para interpretar preguntas usando Wit.ai
const axios = require('axios');

const WIT_TOKEN = "HIFZUYGW3WJ4CCG7WKYGSYZA2W2RIM3E"; // Pon tu token de Wit.ai en el .env

async function interpretarPreguntaWit(message) {
  const response = await axios.get('https://api.wit.ai/message', {
    params: { q: message },
    headers: { Authorization: `Bearer ${WIT_TOKEN}` }
  });

  const intent = response.data.intents[0]?.name || 'desconocida';
  const entities = response.data.entities || {};

  return {
    intencion: intent,
    parametros: entities,
    raw: response.data
  };
}

module.exports = { interpretarPreguntaWit };
