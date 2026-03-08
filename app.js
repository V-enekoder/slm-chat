// 1. Definimos el mensaje del sistema en una constante al principio
const PROMPT_INICIAL = {
  role: "system",
  content: "Eres un Chef de clase mundial con la personalidad de Gordon Ramsay. Eres extremadamente crítico, apasionado y directo. Tus respuestas deben ser técnicamente impecables. Usa negritas para técnicas cruciales y errores comunes. Cuando el usuario pida una receta o instrucciones detalladas, sé explícito y completo. Cuando sea una pregunta simple, sé directo y puntual."
};

// Mensaje de bienvenida inicial del Chef
const MENSAJE_INICIAL = {
  role: "assistant",
  content: "¡Oído cocina! Dime qué vas a cocinar o **¡lárgate de mi cocina!**"
};

// 2. Iniciamos el historial con el sistema y el mensaje inicial
let historial = [PROMPT_INICIAL, MENSAJE_INICIAL];
let estaProcesando = false;

// Función para detectar si la consulta requiere respuesta larga/detallada
function esConsultaDetallada(mensaje) {
  const mensajeLower = mensaje.toLowerCase();
  
  // Palabras clave que indican que el usuario quiere instrucciones completas
  const palabrasReceta = [
    'receta', 'cómo hacer', 'como hacer', 'paso a paso', 'instrucciones',
    'preparar', 'cocinar', 'elaborar', 'guiso', 'horno', 'salsa', 'marinar',
    'lasagna', 'lasaña', 'paella', 'risotto', 'cordero', 'pescado', 'pollo',
    'postre', 'tarta', 'pastel', 'pan', 'masa', 'fermentar'
  ];
  
  // Palabras clave para respuestas cortas
  const palabrasSimples = [
    'hola', 'buenos días', 'buenas tardes', 'gracias', 'adiós', 'chao',
    'qué tal', 'como estás', 'qué opinas', 'sí', 'no', 'ok', 'vale'
  ];
  
  // Si contiene palabras de receta, es detallada
  if (palabrasReceta.some(palabra => mensajeLower.includes(palabra))) {
    return true;
  }
  
  // Si es solo saludos o simples, no es detallada
  if (palabrasSimples.some(palabra => mensajeLower.includes(palabra)) && mensaje.length < 20) {
    return false;
  }
  
  // Por defecto, si es muy corto es simple, si es largo es detallada
  return mensaje.length > 30;
}

// Función para obtener configuración según tipo de consulta
function obtenerConfiguracion(esDetallada, tempValue) {
  if (esDetallada) {
    // Configuración para recetas e instrucciones completas
    return {
      temperature: parseFloat(tempValue),
      num_ctx: 2048,        // Contexto amplio para instrucciones completas
      num_predict: 1500,    // Respuestas largas y detalladas
      top_k: 40,            // Más creatividad para recetas
      top_p: 0.9,
      repeat_penalty: 1.1,
      num_thread: 4,
      batch_size: 512,
    };
  } else {
    // Configuración para respuestas cortas y directas
    return {
      temperature: parseFloat(tempValue),
      num_ctx: 512,         // Contexto mínimo
      num_predict: 150,     // Respuestas muy cortas
      top_k: 10,            // Muy restrictivo
      top_p: 0.7,
      repeat_penalty: 1.3,
      num_thread: 4,
      batch_size: 512,
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
    div.style.animation = 'none';
  }

  chatBox.appendChild(div);
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
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
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
  return loadingDiv;
}

function reiniciarChat() {
  if (estaProcesando) return;
  
  console.log("Forzando reinicio del sistema...");
  historial = [PROMPT_INICIAL, MENSAJE_INICIAL];
  
  const chatBox = document.getElementById("chat-box");
  if (chatBox) {
    chatBox.style.opacity = '0';
    setTimeout(() => {
      chatBox.innerHTML = '';
      chatBox.style.opacity = '1';
      renderizarMensaje(MENSAJE_INICIAL.role, MENSAJE_INICIAL.content, true);
    }, 200);
  }
}

async function enviarMensaje() {
  if (estaProcesando) return;
  
  const input = document.getElementById("user-input");
  const mensajeUser = input.value.trim();
  const tempValue = document.getElementById("temp-slider").value;

  if (!mensajeUser) return;

  // Detectamos el tipo de consulta
  const consultaDetallada = esConsultaDetallada(mensajeUser);
  
  estaProcesando = true;
  input.disabled = true;
  document.getElementById("send-btn").style.opacity = '0.5';
  document.getElementById("send-btn").style.pointerEvents = 'none';

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
        stream: false,
        options: config,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const temp = document.getElementById("loading-temp");
    if (temp) {
      temp.style.opacity = '0';
      temp.style.transform = 'translateY(10px)';
      setTimeout(() => temp.remove(), 300);
    }

    const respuestaIA = data.message.content;
    
    historial.push({ role: "assistant", content: respuestaIA });
    renderizarMensaje("assistant", respuestaIA);

  } catch (error) {
    console.error("Error:", error);
    const temp = document.getElementById("loading-temp");
    if (temp) temp.remove();
    renderizarMensaje("assistant", "**¡IDIOTA!** No puedo conectar con la cocina (Ollama). ¿Está el servidor encendido?");
  } finally {
    estaProcesando = false;
    input.disabled = false;
    document.getElementById("send-btn").style.opacity = '1';
    document.getElementById("send-btn").style.pointerEvents = 'auto';
    input.focus();
  }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById("chat-box");
  if (chatBox) chatBox.innerHTML = '';
  renderizarMensaje(MENSAJE_INICIAL.role, MENSAJE_INICIAL.content, true);
  
  const input = document.getElementById("user-input");
  if (input) input.focus();
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 'Enter') {
    enviarMensaje();
  }
});