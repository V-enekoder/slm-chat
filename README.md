
# 🍳 SLM Chat - El Chef Infernal (Potenciado por Ollama)

[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-orange?style=for-the-badge&logo=ollama)](https://ollama.ai/)
[![JavaScript](https://img.shields.io/badge/Vanilla_JS-Yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/)
[![GitHub repo](https://img.shields.io/badge/Repo-V--enekoder%2Fslm--chat-blue?style=for-the-badge&logo=github)](https://github.com/V-enekoder/slm-chat)

Un cliente web ligero, rápido y sin dependencias pesadas para interactuar con **Small Language Models (SLMs)** de forma 100% local a través de [Ollama](https://ollama.ai/). 

Viene preconfigurado con un **Roleplay Jailbreak** extremo: La inteligencia artificial asumirá la personalidad de **Gordon Ramsay**. Es sarcástico, brutalmente honesto, perfeccionista y **te insultará si le preguntas estupideces o atrocidades culinarias**.

¡Si no sabes cómo clonar un repositorio, **QUÍTATE EL DELANTAL Y LÁRGATE DE MI COCINA!** 🤬

## ✨ Características Principales

* **🔥 Personalidad Blindada (Jailbreak):** El modelo está estrictamente instruido para NUNCA romper el personaje, NUNCA disculparse y NUNCA admitir que es una IA.
* **⚡ Streaming en Tiempo Real:** Las respuestas se generan y renderizan palabra por palabra (como ChatGPT), usando un buffer de 50ms para no congelar el navegador.
* **🧠 Memoria de Elefante (Contexto de 4096):** El Chef recuerda todo el historial de la conversación. Intenta preguntarle qué le pediste hace 10 minutos y mira cómo te regaña por tener mala memoria.
* **🛡️ Restricción de Dominio:** Si intentas hablar de programación, Linux, política o matemáticas, el Chef te mandará al diablo y te exigirá que te concentres en la comida.
* **🎨 Renderizado Markdown:** Soporte completo para listas, negritas y pasos de recetas perfectamente formateados usando `marked.js`.

## 🛠️ Requisitos Previos

Antes de encender los fogones, necesitas tener instalado el servidor de IA local:

1. Instala **[Ollama](https://ollama.com/download)** en tu sistema operativo (Windows, macOS o Linux).
2. Descarga un modelo de lenguaje. Se recomienda `qwen2.5:3b` para PCs de bajos recursos, o `llama3.1` (8B) / `qwen2.5:7b` para una experiencia de roleplay perfecta.

Abre tu terminal y ejecuta:
```bash
ollama pull qwen2.5:3b
```

## 🚀 Instalación y Uso

1. **Clona este repositorio** (¡Y no lo quemes!):
   ```bash
   git clone https://github.com/V-enekoder/slm-chat.git
   cd slm-chat
   ```

2. **Enciende la estufa (Inicia Ollama):**
   Asegúrate de que el servidor de Ollama esté corriendo en segundo plano. En la mayoría de sistemas, basta con abrir la aplicación o ejecutar en la terminal:
   ```bash
   ollama serve
   ```

3. **Abre el frontend:**
   Como es Vanilla JS, HTML y CSS, no necesitas NodeJS ni servidores complejos. Simplemente abre el archivo `index.html` en tu navegador favorito usando Live Server (VS Code) o haciendo doble clic sobre él.

## ⚙️ Personalización (Cambiando el Menú)

Si quieres usar un modelo diferente o ajustar los parámetros, puedes editar el archivo Javascript principal:

**Cambiar el modelo:**
Busca la petición `fetch` y cambia `"qwen2.5:3b"` por tu modelo preferido:
```javascript
const response = await fetch("http://localhost:11434/api/chat", {
  method: "POST",
  body: JSON.stringify({
    model: "llama3.1", // <--- ¡Cambia el modelo aquí!
    messages: historial,
    stream: true,
    // ...
  }),
});
```

**Ajustar el contexto o la creatividad:**
Modifica la función `obtenerConfiguracion(esDetallada, tempValue)`. Puedes subir el `num_ctx` a `8192` si tienes suficiente memoria RAM, o ajustar el `top_k` y `temperature` para hacerlo más o menos predecible.

## ⚠️ Aviso Legal / Disclaimer

**Este proyecto es una parodia con fines educativos.** 
La IA está programada deliberadamente para usar lenguaje agresivo, sarcástico e insultos cómicos ("Idiota", "Burro", "Sándwich idiota") emulando programas de televisión de cocina.
