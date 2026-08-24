document.addEventListener('DOMContentLoaded', async () => {
  const btnToggleForm = document.getElementById('btn-toggle-form');
  const btnCancelar = document.getElementById('btn-cancelar');
  const formContainer = document.getElementById('form-container');
  const planillaForm = document.getElementById('planilla-form');
  const inputBuscador = document.getElementById('input-buscador');

  const categorias = ['hardware', 'software', 'redes', 'mantenimiento', 'lider'];
  let planillas = [];

  // Cargar planillas desde el archivo JSON de GitHub
  const cargarPlanillasDesdeJSON = async () => {
    try {
      const respuesta = await fetch('planillas.json');
      planillas = await respuesta.json();
    } catch (error) {
      console.error('Error al cargar planillas.json:', error);
      planillas = [];
    }
    renderTarjetas();
  };

  // Función para ofrecer la descarga del JSON actualizado al hacer cambios
  const ofrecerDescargaJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planillas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "planillas.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    alert('Se ha descargado un archivo "planillas.json" actualizado. ¡Súbelo a tu repositorio de GitHub para que todos vean los cambios!');
  };

  const abrirFormulario = () => formContainer.classList.remove('hidden');
  const cerrarFormulario = () => {
    formContainer.classList.add('hidden');
    planillaForm.reset();
  };

  btnToggleForm.addEventListener('click', abrirFormulario);
  btnCancelar.addEventListener('click', cerrarFormulario);

  // Renderizar las tarjetas
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
    renderTarjetas(inputBuscador.value);
    cerrarFormulario();
    ofrecerDescargaJSON();
  });

  // Eliminar planilla con clave
  window.eliminarPlanilla = (id) => {
    const codigoIngresado = prompt('Para eliminar esta planilla, ingresa el código de autorización:');

    if (codigoIngresado === null) return;

    if (codigoIngresado.trim() === 'lider') {
      planillas = planillas.filter(p => p.id !== id);
      renderTarjetas(inputBuscador.value);
      alert('Planilla eliminada de la pantalla.');
      ofrecerDescargaJSON();
    } else {
      alert('Código incorrecto. No tienes permiso para eliminar esta planilla.');
    }
  };

  inputBuscador.addEventListener('input', (e) => {
    renderTarjetas(e.target.value);
  });

  cargarPlanillasDesdeJSON();
});