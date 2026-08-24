const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby7W4rsJoG9yUMJbGlu2ZJ7G4wTnskdIJxPTv1i5jHFqb_czUZsvMsa2hwhLGJYAB_AXA/exec";

document.addEventListener('DOMContentLoaded', () => {
  const btnToggleForm = document.getElementById('btn-toggle-form');
  const btnCancelar = document.getElementById('btn-cancelar');
  const formContainer = document.getElementById('form-container');
  const planillaForm = document.getElementById('planilla-form');
  const inputBuscador = document.getElementById('input-buscador');

  const categorias = ['hardware', 'software', 'redes', 'mantenimiento', 'lider'];
  let planillas = [];

  // Cargar planillas desde Google Drive
  const cargarPlanillas = async () => {
    try {
      const res = await fetch(APPS_SCRIPT_URL);
      planillas = await res.json();
    } catch (error) {
      console.error('Error al conectar con Google Drive:', error);
      planillas = [];
    }
    renderTarjetas();
  };

  // Guardar cambios en Google Drive
  const guardarEnDrive = async () => {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planillas)
      });
      // Esperar 1 segundo a que Google procese antes de recargar
      setTimeout(cargarPlanillas, 1000);
    } catch (error) {
      alert('Error al guardar datos en Drive');
    }
  };

  const abrirFormulario = () => formContainer.classList.remove('hidden');
  const cerrarFormulario = () => {
    formContainer.classList.add('hidden');
    planillaForm.reset();
  };

  btnToggleForm.addEventListener('click', abrirFormulario);
  btnCancelar.addEventListener('click', cerrarFormulario);

  // Renderizar tarjetas por categoría
  const renderTarjetas = (filtro = '') => {
    categorias.forEach(cat => {
      const grid = document.getElementById(`grid-${cat}`);
      if (grid) grid.innerHTML = '';
    });

    const textoFiltro = filtro.toLowerCase().trim();
    const conteo = { hardware: 0, software: 0, redes: 0, mantenimiento: 0, lider: 0 };

    planillas.forEach((planilla) => {
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
      id: Date.now().toString(),
      titulo: document.getElementById('titulo').value.trim(),
      categoria: document.getElementById('categoria').value,
      descripcion: document.getElementById('descripcion').value.trim(),
      enlace: document.getElementById('enlace').value.trim()
    };

    planillas.push(nuevaPlanilla);
    cerrarFormulario();
    guardarEnDrive();
  });

  // Eliminar con contraseña 'lider'
  window.eliminarPlanilla = (id) => {
    const codigoIngresado = prompt('Para eliminar esta planilla, ingresa el código de autorización:');

    if (codigoIngresado === null) return;

    if (codigoIngresado.trim() === 'lider') {
      planillas = planillas.filter(p => p.id !== id);
      guardarEnDrive();
    } else {
      alert('Código incorrecto. No tienes permiso para eliminar esta planilla.');
    }
  };

  inputBuscador.addEventListener('input', (e) => {
    renderTarjetas(e.target.value);
  });

  cargarPlanillas();
});