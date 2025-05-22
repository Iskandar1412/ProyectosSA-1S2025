// Servicio para interpretar preguntas usando solo el SDK oficial de OpenAI, mejorado para depuración y robustez
const { OpenAI } = require("openai");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

async function interpretarPregunta(pregunta) {
  const prompt = `
Eres un asistente que ayuda a los usuarios a consultar información de productos, órdenes, devoluciones y carrito en una tienda online. Analiza la pregunta y responde SOLO con un objeto JSON con la intención principal y los parámetros relevantes. Ejemplos de intenciones: 'consultar_producto', 'consultar_orden', 'consultar_devolucion', 'agregar_carrito'.

Ejemplo de salida:
{"intencion": "consultar_producto", "nombre": "Laptop Dell"}

Pregunta del usuario: ${pregunta}
Respuesta:
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const respuesta = completion.choices[0]?.message?.content?.trim() || "";
    console.log("Respuesta cruda de OpenAI:", respuesta);

    // Intenta extraer el primer bloque JSON de la respuesta
    const match = respuesta.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        const json = JSON.parse(match[0]);
        return json;
      } catch (e) {
        return { intencion: "desconocida", error: "JSON malformado", raw: respuesta };
      }
    } else {
      return { intencion: "desconocida", error: "No se encontró JSON en la respuesta", raw: respuesta };
    }
  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    return { intencion: "desconocida", error: error.message || "Error desconocido" };
  }
}

module.exports = {
  interpretarPregunta,
};
