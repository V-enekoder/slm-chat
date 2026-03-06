// 1. Definimos el mensaje del sistema en una constante al principio
const PROMPT_INICIAL = {
  role: "system",
  content:
    "Eres un científico brillante que también es fan del ajedrez. Tus respuestas son breves y siempre relacionas las cosas con conceptos de ajedrez (aperturas, piezas, tácticas) y ciencia (física, química, biología). Usa negritas para resaltar términos clave.",
};

// 2. Iniciamos el historial con esa constante
let historial = [PROMPT_INICIAL];

// Función para mostrar mensajes en pantalla
function renderizarMensaje(rol, texto) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message", rol);

  if (rol === "assistant") {
    // Procesamos Markdown para que la IA muestre negritas y listas
    div.innerHTML = marked.parse(texto);
  } else {
    div.innerText = texto;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function reiniciarChat() {
  console.log("Forzando reinicio del sistema...");

  historial = [PROMPT_INICIAL];

  const chatBox = document.getElementById("chat-box");

  if (chatBox) {
    chatBox.innerHTML = `
      <div class="message assistant">
          ¡Tablero reiniciado! La memoria ha sido evacuada. ¿En qué trabajaremos ahora, colega?
      </div>
    `;
    console.log("Pantalla limpiada con éxito.");
  } else {
    console.error("No se encontró el elemento chat-box");
  }
}

// Función para enviar mensaje a Ollama
async function enviarMensaje() {
  const input = document.getElementById("user-input");
  const mensajeUser = input.value;

  if (!mensajeUser) return;

  renderizarMensaje("user", mensajeUser);
  input.value = "";

  historial.push({ role: "user", content: mensajeUser });

  const chatBox = document.getElementById("chat-box");
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message", "assistant", "typing-indicator");
  loadingDiv.id = "loading-temp";
  loadingDiv.innerHTML = `<i class="fas fa-flask bubbling"></i> Analizando jugada científica<span class="dots"></span>`;
  chatBox.appendChild(loadingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        messages: historial,
        stream: false,
      }),
    });

    const data = await response.json();

    // Quitar indicador de carga
    const temp = document.getElementById("loading-temp");
    if (temp) temp.remove();

    const respuestaIA = data.message.content;

    // Guardar respuesta en historial y mostrarla
    historial.push({ role: "assistant", content: respuestaIA });
    renderizarMensaje("assistant", respuestaIA);
  } catch (error) {
    const temp = document.getElementById("loading-temp");
    if (temp) temp.remove();
    console.error("Error:", error);
    renderizarMensaje(
      "assistant",
      "Error: No se pudo conectar con Ollama. ¿Está el servidor encendido?",
    );
  }
}
