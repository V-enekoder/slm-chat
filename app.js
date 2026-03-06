let historial = [
  {
    role: "system",
    content:
      "Eres un científico brillante que también es fan del ajedrez. Tus respuestas son breves y siempre relacionas las cosas con conceptos de ajedrez (aperturas, piezas, tácticas) y ciencia (física, química, biología).",
  },
];

function renderizarMensaje(rol, texto) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message", rol);

  if (rol === "assistant") {
    div.innerHTML = marked.parse(texto);
  } else {
    div.innerText = texto;
  }

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// NUEVO: Función para limpiar memoria y pantalla
function reiniciarChat() {
  if (
    confirm(
      "¿Deseas limpiar el tablero y reiniciar el experimento? Se borrará la memoria.",
    )
  ) {
    // 1. Resetear el array de historial
    historial = [PROMPT_INICIAL];

    // 2. Limpiar el contenedor de mensajes en el HTML
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = `
            <div class="message assistant">
                ¡Tablero reiniciado! La memoria ha sido evacuada. ¿En qué trabajaremos ahora, colega?
            </div>
        `;

    console.log("Memoria del Chatbot reiniciada.");
  }
}

async function enviarMensaje() {
  const input = document.getElementById("user-input");
  const mensajeUser = input.value;

  if (!mensajeUser) return;

  // 1. Mostrar mensaje del usuario
  renderizarMensaje("user", mensajeUser);
  input.value = "";

  // 2. Agregar al historial
  historial.push({ role: "user", content: mensajeUser });

  const chatBox = document.getElementById("chat-box");
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message", "assistant", "typing-indicator");
  loadingDiv.id = "loading-temp"; // ID para poder borrarlo luego
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

    const temp = document.getElementById("loading-temp");
    if (temp) temp.remove();

    const respuestaIA = data.message.content;

    // 4. Guardar en historial y mostrar respuesta real
    historial.push({ role: "assistant", content: respuestaIA });
    renderizarMensaje("assistant", respuestaIA);
  } catch (error) {
    // Si hay error, también borramos el indicador
    const temp = document.getElementById("loading-temp");
    if (temp) temp.remove();

    console.error("Error:", error);
    renderizarMensaje(
      "assistant",
      "Error en el laboratorio: Conexión perdida con el servidor.",
    );
  }
}
