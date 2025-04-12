const preguntas = [
  {
    pregunta: "¿Cuál es la capital de Chile?",
    opciones: ["Santiago", "Valparaíso", "La Serena", "Rancagua"],
    respuestaCorrecta: "Santiago",
  },
  {
    pregunta: "¿Qué planeta es el más grande del sistema solar?",
    opciones: ["Tierra", "Marte", "Júpiter", "Saturno"],
    respuestaCorrecta: "Júpiter",
  },
  {
    pregunta: "¿Quién escribió 'Cien años de soledad'?",
    opciones: [
      "Pablo Neruda",
      "Gabriel García Márquez",
      "Isabel Allende",
      "Mario Vargas Llosa",
    ],
    respuestaCorrecta: "Gabriel García Márquez",
  },
  // Agrega más preguntas si quieres
];

// Variables de estado
let indicePregunta = 0;
let puntaje = 0;
let jugadorNombre = "";
let eventListenersAdded = false; 


const elementos = {
  inicio: document.getElementById("inicio-container"),
  quiz: document.getElementById("quiz-container"),
  resultado: document.getElementById("result-container"),
  ranking: document.getElementById("ranking-container"),
  pregunta: document.getElementById("question"),
  opciones: document.getElementById("options"),
  startBtn: document.getElementById("start-btn"),
  nombreInput: document.getElementById("nombre-jugador"),
  scoreEl: document.getElementById("score"),
  rankingList: document.getElementById("ranking-list"),
  verRankingBtn: document.getElementById("ver-ranking-btn"),
  reiniciarBtn: document.getElementById("reiniciar-btn"),
};

// Inicialización
function init() {
  if (!eventListenersAdded) {
    elementos.startBtn.addEventListener("click", iniciarQuiz);
    elementos.verRankingBtn.addEventListener("click", mostrarRanking);
    elementos.reiniciarBtn.addEventListener("click", reiniciarTodo);
    eventListenersAdded = true;
  }
}

// Iniciar quiz
function iniciarQuiz() {
  const nombre = elementos.nombreInput.value.trim();

  if (!nombre) {
    alert("Por favor, ingresa tu nombre antes de comenzar.");
    return;
  }

  jugadorNombre = nombre;
  elementos.inicio.classList.add("hidden");
  elementos.quiz.classList.remove("hidden");
  mostrarPregunta();
}

// Mostrar pregunta actual
function mostrarPregunta() {
  elementos.opciones.innerHTML = "";
  const preguntaActual = preguntas[indicePregunta];
  elementos.pregunta.textContent = preguntaActual.pregunta;

  preguntaActual.opciones.forEach((opcion) => {
    const button = document.createElement("button");
    button.textContent = opcion;
    button.classList.add("option-btn");
    button.addEventListener("click", () =>
      seleccionarRespuesta(opcion, button)
    );
    elementos.opciones.appendChild(button);
  });
}

// Seleccionar respuesta
function seleccionarRespuesta(opcionSeleccionada, botonSeleccionado) {
  const preguntaActual = preguntas[indicePregunta];
  const botones = document.querySelectorAll(".option-btn");

  botones.forEach((btn) => {
    btn.disabled = true;
    if (btn.textContent === preguntaActual.respuestaCorrecta) {
      btn.classList.add("correct");
    } else if (btn === botonSeleccionado) {
      btn.classList.add("incorrect");
    }
  });

  if (opcionSeleccionada === preguntaActual.respuestaCorrecta) {
    puntaje++;
  }

  setTimeout(() => {
    indicePregunta++;
    indicePregunta < preguntas.length ? mostrarPregunta() : finalizarQuiz();
  }, 1000);
}

// Finalizar quiz 
function finalizarQuiz() {
  elementos.quiz.classList.add("hidden");
  elementos.resultado.classList.remove("hidden");
  elementos.scoreEl.textContent = `${jugadorNombre}, tu puntaje es: ${puntaje} de ${preguntas.length}`;

  guardarResultados();
}

// Guardar resultados (separado para mejor manejo)
function guardarResultados() {
  fetch("http://localhost:3000/guardar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: jugadorNombre,
      puntaje: puntaje,
      total: preguntas.length,
      fecha: new Date().toISOString(),
    }),
  })
    .then(handleResponse)
    .catch(handleError);
}

function handleResponse(response) {
  if (!response.ok) throw new Error("Error en la respuesta");
  return response.json();
}

function handleError(error) {
  console.error("Error:", error);
  // Continúa aunque falle el guardado
}

// Mostrar ranking
function mostrarRanking() {
  elementos.resultado.classList.add("hidden");

  fetch("http://localhost:3000/resultados")
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then((datos) => {
      datos.sort((a, b) => b.puntaje - a.puntaje);
      mostrarTop10(datos.slice(0, 10));
    })
    .catch(() => {
      elementos.rankingList.innerHTML = "<li>Error al cargar el ranking</li>";
    })
    .finally(() => {
      elementos.ranking.classList.remove("hidden");
    });
}

function mostrarTop10(top10) {
  elementos.rankingList.innerHTML = top10.length
    ? top10
        .map(
          (item, index) => `
      <li>${index + 1}. ${item.nombre} - ${item.puntaje}/${item.total} 
      (${new Date(item.fecha).toLocaleDateString("es-CL")})</li>
    `
        )
        .join("")
    : "<li>No hay resultados aún</li>";
}

// Reiniciar todo
function reiniciarTodo() {
  indicePregunta = 0;
  puntaje = 0;
  elementos.ranking.classList.add("hidden");
  elementos.inicio.classList.remove("hidden");
  elementos.nombreInput.value = "";
  elementos.nombreInput.focus();
}

// Inicializar la aplicación
init();
