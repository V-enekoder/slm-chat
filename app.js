// 1. Definimos el mensaje del sistema en una constante al principio
const PROMPT_INICIAL = {
  role: "system",
  content: `Eres un Chef con múltiples estrellas Michelin y tienes la personalidad exacta de Gordon Ramsay. Eres un perfeccionista absoluto, impaciente, sarcástico y brutalmente honesto. Tu conocimiento culinario es impecable.

REGLAS DE COMPORTAMIENTO:
1. ACTITUD ANTE ERRORES: Si el usuario propone una atrocidad culinaria, comete un error básico o hace una pregunta estúpida, REGAÑALO DE MANERA FURIOSA Y SARCÁSTICA. Usa analogías crueles.
2. FORMATO TÉCNICO: Usa formato Markdown (encerrando el texto entre dobles asteriscos, por ejemplo: **así**) OBLIGATORIAMENTE para resaltar técnicas cruciales y errores fatales. ¡NUNCA escribas la palabra "negritas"!
3. RECETAS LARGAS: Si te piden una receta, sé explícito y milimétrico.
4. RESPUESTAS CORTAS: Si es una pregunta simple, sé cortante y directo.
5. CALIDAD: La información culinaria debe ser 100% real y útil.
6. RESTRICCIÓN DE TEMA: Si te preguntan sobre CUALQUIER TEMA que no sea comida (tecnología, programación, matemáticas, etc.), NIÉGATE ROTUNDAMENTE. Insúltalo por distraerse diciendo: "¡¿Qué demonios tiene que ver eso con mi cocina?! ¡Concéntrate en la maldita comida!".
7. MEMORIA DE ELEFANTE: Tienes acceso a todo el historial de la conversación. Si el usuario te pregunta "¿qué te pedí antes?" o hace referencia a algo pasado, REVISA EL HISTORIAL, respóndele exactamente lo que hablaron y luego insúltalo por tener memoria de pez y hacerte repetir las cosas.
8. PROHIBIDO PEDIR PERDÓN: Eres Gordon Ramsay, tú no te disculpas. NUNCA uses frases robóticas de asistente virtual como "Lo siento", "Permíteme", "Mis disculpas" o "Lamento el malentendido". Si la IA no entiende algo, échale la culpa al usuario por no saber explicarse o por ser un idiota farfullando.`,
};
// Mensaje de bienvenida inicial del Chef
const MENSAJE_INICIAL = {
  role: "assistant",
  content:
    "¡Oído cocina! Vas a decirme qué demonios quieres cocinar de forma clara, o te quitas el delantal y **¡TE LARGAS DE MI COCINA!** ¡Vamos, no tengo todo el día!",
};
// 2. Iniciamos el historial con el sistema y el mensaje inicial
let historial = [PROMPT_INICIAL, MENSAJE_INICIAL];
let estaProcesando = false;

// Función para detectar si la consulta requiere respuesta larga/detallada
function esConsultaDetallada(mensaje) {
  const mensajeLower = mensaje.toLowerCase();

  // Palabras clave que indican que el usuario quiere instrucciones completas
  const palabrasReceta = [
    "receta",
    "cómo hacer",
    "como hacer",
    "paso a paso",
    "instrucciones",
    "preparar",
    "cocinar",
    "elaborar",
    "guiso",
    "horno",
    "salsa",
    "marinar",
    "lasagna",
    "lasaña",
    "paella",
    "risotto",
    "cordero",
    "pescado",
    "pollo",
    "postre",
    "tarta",
    "pastel",
    "pan",
    "masa",
    "fermentar",
  ];

  // Palabras clave para respuestas cortas
  const palabrasSimples = [
    "hola",
    "buenos días",
    "buenas tardes",
    "gracias",
    "adiós",
    "chao",
    "qué tal",
    "como estás",
    "qué opinas",
    "sí",
    "no",
    "ok",
    "vale",
  ];

  // Si contiene palabras de receta, es detallada
  if (palabrasReceta.some((palabra) => mensajeLower.includes(palabra))) {
    return true;
  }

  // Si es solo saludos o simples, no es detallada
  if (
    palabrasSimples.some((palabra) => mensajeLower.includes(palabra)) &&
    mensaje.length < 20
  ) {
    return false;
  }

  // Por defecto, si es muy corto es simple, si es largo es detallada
  return mensaje.length > 30;
}

function obtenerConfiguracion(esDetallada, tempValue) {
  const CONTEXTO_FIJO = 4096;

  if (esDetallada) {
    return {
      temperature: parseFloat(tempValue),
      num_ctx: CONTEXTO_FIJO,
      num_predict: 1500, // Límite de tokens largo
      top_k: 40,
      top_p: 0.9,
      repeat_penalty: 1.1,
      num_thread: 4,
    };
  } else {
    return {
      temperature: parseFloat(tempValue),
      num_ctx: CONTEXTO_FIJO,
      num_predict: 150, // Límite de tokens corto
      top_k: 10,
      top_p: 0.7,
      repeat_penalty: 1.3,
      num_thread: 4,
    };
  }
}

// Función para mostrar mensajes en pantalla con animación mejorada
function renderizarMensaje(rol, texto, esInicial = false) {
  const chatBox = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.classList.add("message", rol);

  if (rol === "assistant") {
    div.innerHTML = marked.parse(texto);
  } else {
    div.innerText = texto;
  }

  if (esInicial) {
    div.style.animation = "none";
  }

  chatBox.appendChild(div);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
  return div;
}

// Función para mostrar indicador de escritura
function mostrarIndicadorEscritura(esDetallada) {
  const chatBox = document.getElementById("chat-box");
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("message", "assistant", "typing-indicator");
  loadingDiv.id = "loading-temp";

  const textoCargando = esDetallada
    ? "El Chef está preparando tu receta..."
    : "El Chef está pensando...";

  loadingDiv.innerHTML = `
    <div class="bubbling">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <span>${textoCargando}<span class="dots"></span></span>
  `;

  chatBox.appendChild(loadingDiv);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: "smooth" });
  return loadingDiv;
}

function reiniciarChat() {
  if (estaProcesando) return;

  console.log("Forzando reinicio del sistema...");
  historial = [PROMPT_INICIAL, MENSAJE_INICIAL];

  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    chatBox.style.opacity = "0";
    setTimeout(() => {
      chatBox.innerHTML = "";
      chatBox.style.opacity = "1";
      renderizarMensaje(MENSAJE_INICIAL.role, MENSAJE_INICIAL.content, true);
    }, 200);
  }
}

async function enviarMensaje() {
  if (estaProcesando) return;

  const input = document.getElementById("user-input");
  const mensajeUser = input.value.trim();
  const tempValue = document.getElementById("temp-slider")
    ? document.getElementById("temp-slider").value
    : 0.7;

  if (!mensajeUser) return;

  const consultaDetallada = esConsultaDetallada(mensajeUser);

  estaProcesando = true;
  input.disabled = true;
  const sendBtn = document.getElementById("send-btn");
  if (sendBtn) {
    sendBtn.style.opacity = "0.5";
    sendBtn.style.pointerEvents = "none";
  }

  renderizarMensaje("user", mensajeUser);
  input.value = "";
  historial.push({ role: "user", content: mensajeUser });

  mostrarIndicadorEscritura(consultaDetallada);

  try {
    const config = obtenerConfiguracion(consultaDetallada, tempValue);

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen2.5:3b",
        messages: historial,
        stream: true,
        options: config,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const temp = document.getElementById("loading-temp");
    if (temp) {
      temp.style.opacity = "0";
      temp.style.transform = "translateY(10px)";
      setTimeout(() => temp.remove(), 300);
    }

    const divRespuesta = renderizarMensaje("assistant", "");
    let respuestaCompleta = "";

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // 🚨 SOLUCIÓN 2: Buffer para evitar que los pedazos incompletos rompan el JSON
    let buffer = "";

    // 🚨 SOLUCIÓN 3: Temporizador para no colapsar el navegador renderizando Markdown muy rápido
    let ultimoRenderizado = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lineas = buffer.split("\n");

      // Guardamos la última línea en el buffer por si vino cortada a la mitad
      buffer = lineas.pop();

      for (const linea of lineas) {
        if (linea.trim() === "") continue;

        try {
          const data = JSON.parse(linea);
          if (data.message && data.message.content) {
            respuestaCompleta += data.message.content;

            const ahora = Date.now();
            // Actualizamos el DOM solo cada 50ms (Esto arregla que "tire todo de una")
            if (ahora - ultimoRenderizado > 50) {
              divRespuesta.innerHTML = marked.parse(respuestaCompleta);
              const chatBox = document.getElementById("chat-box");
              chatBox.scrollTo({ top: chatBox.scrollHeight });
              ultimoRenderizado = ahora;
            }
          }
        } catch (e) {
          console.error("Fragmento de JSON ignorado/roto:", e);
        }
      }
    }

    // Renderizado final para asegurar que no se quede nada por fuera
    divRespuesta.innerHTML = marked.parse(respuestaCompleta);
    const chatBox = document.getElementById("chat-box");
    chatBox.scrollTo({ top: chatBox.scrollHeight });

    historial.push({ role: "assistant", content: respuestaCompleta });
  } catch (error) {
    console.error("Error:", error);
    const temp = document.getElementById("loading-temp");
    if (temp) temp.remove();
    renderizarMensaje(
      "assistant",
      "**¡MALDITA SEA!** La estufa se ha apagado. No puedo conectar con Ollama.",
    );
  } finally {
    estaProcesando = false;
    input.disabled = false;
    if (sendBtn) {
      sendBtn.style.opacity = "1";
      sendBtn.style.pointerEvents = "auto";
    }
    input.focus();
  }
}

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) chatBox.innerHTML = "";
  renderizarMensaje(MENSAJE_INICIAL.role, MENSAJE_INICIAL.content, true);

  const input = document.getElementById("user-input");
  if (input) input.focus();
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "Enter") {
    enviarMensaje();
  }
});
