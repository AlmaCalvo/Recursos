document.addEventListener('DOMContentLoaded', () => {
  const btnToggleForm = document.getElementById('btn-toggle-form');
  const btnCancelar = document.getElementById('btn-cancelar');
  const formContainer = document.getElementById('form-container');
  const planillaForm = document.getElementById('planilla-form');
  const inputBuscador = document.getElementById('input-buscador');

  const categorias = ['hardware', 'software', 'redes', 'mantenimiento', 'lider'];

  // Cargar planillas desde localStorage
  let planillas = JSON.parse(localStorage.getItem('planillas_v2')) || [];

  // Abrir/Cerrar formulario
  const abrirFormulario = () => formContainer.classList.remove('hidden');
  const cerrarFormulario = () => {
    formContainer.classList.add('hidden');
    planillaForm.reset();
  };

  btnToggleForm.addEventListener('click', abrirFormulario);
  btnCancelar.addEventListener('click', cerrarFormulario);

  // Renderizar planillas en sus contenedores
  const renderTarjetas = (filtro = '') => {
    // Limpiar todas las grillas
    categorias.forEach(cat => {
      const grid = document.getElementById(`grid-${cat}`);
      if (grid) grid.innerHTML = '';
    });

    const textoFiltro = filtro.toLowerCase().trim();

    // Contadores para ver si una sección queda vacía
    const conteo = { hardware: 0, software: 0, redes: 0, mantenimiento: 0, lider: 0 };

    planillas.forEach((planilla) => {
      // Filtrar por título o descripción
      const coincide = planilla.titulo.toLowerCase().includes(textoFiltro) || 
                       planilla.descripcion.toLowerCase().includes(textoFiltro);

      if (coincide) {
        const grid = document.getElementById(`grid-${planilla.categoria}`);
        if (grid) {
          conteo[planilla.categoria]++;
          
          const card = document.createElement('article');
          card.className = 'card';
          card.innerHTML = `
            <div>
              <h3 class="card-title">${planilla.titulo}</h3>
              <p class="card-description">${planilla.descripcion}</p>
            </div>
            <div class="card-footer">
              <a href="${planilla.enlace}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                Abrir
              </a>
              <button class="btn btn-danger" onclick="eliminarPlanilla('${planilla.id}')">Eliminar</button>
            </div>
          `;
          grid.appendChild(card);
        }
      }
    });

    // Mensaje si no hay tarjetas en una categoría
    categorias.forEach(cat => {
      const grid = document.getElementById(`grid-${cat}`);
      if (grid && conteo[cat] === 0) {
        grid.innerHTML = '<p class="empty-msg">No hay planillas en esta sección.</p>';
      }
    });
  };

  // Guardar nueva planilla
  planillaForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nuevaPlanilla = {
      id: Date.now().toString(), // ID único para identificarla al eliminar
      titulo: document.getElementById('titulo').value.trim(),
      categoria: document.getElementById('categoria').value,
      descripcion: document.getElementById('descripcion').value.trim(),
      enlace: document.getElementById('enlace').value.trim()
    };

    planillas.push(nuevaPlanilla);
    localStorage.setItem('planillas_v2', JSON.stringify(planillas));

    renderTarjetas(inputBuscador.value);
    cerrarFormulario();
  });

  // Eliminar planilla CON CÓDIGO DE SEGURIDAD
  window.eliminarPlanilla = (id) => {
    const codigoIngresado = prompt('Para eliminar esta planilla, ingresa el código de autorización:');

    if (codigoIngresado === null) return; // Si cancela la ventana emergente

    if (codigoIngresado.trim() === 'lider') {
      planillas = planillas.filter(p => p.id !== id);
      localStorage.setItem('planillas_v2', JSON.stringify(planillas));
      renderTarjetas(inputBuscador.value);
      alert('Planilla eliminada con éxito.');
    } else {
      alert('Código incorrecto. No tienes permiso para eliminar esta planilla.');
    }
  };

  // Evento del buscador
  inputBuscador.addEventListener('input', (e) => {
    renderTarjetas(e.target.value);
  });

  // Carga inicial
  renderTarjetas();
});