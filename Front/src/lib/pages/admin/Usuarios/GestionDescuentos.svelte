<script>
    import { onMount } from "svelte";
    import { pathUsuariosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';
    
    // Datos
    let descuentos = [];
    let descuentoEditando = null;
    let editandoId = null;
    
    // Estados modales
    let mostrarModalDescuento = false;
    
    // Formularios
    let nuevoDescuento = {
        porcentaje: '',
        minimo: '',
        maximo: '',
        id: 0
    };
    
    // Carga inicial de datos
    async function obtenerDescuentos() {
        try {
            const resDescuentos = await fetch(`${pathUsuariosMS}/admin/descuentos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            if(!resDescuentos.ok) {
                throw new Error('Error en la petición')
            }
    
            const dataDescuentos = await resDescuentos.json();
            if (dataDescuentos.success) descuentos = dataDescuentos.message;
        } catch(e) {
            console.log("Error en la obtención de porcentajes:", e)
            mostrarError("Error al cargar porcentajes")
        }
    }
    
    // Productos
    function iniciarEdicion(descuento_option) {
        descuentoEditando = {
            porcentaje: descuento_option.porcentaje_descuento || '',
            minimo: descuento_option.rango_compra_min || '',
            maximo: descuento_option.rango_compra_max || '',
            id: descuento_option.id_descuento || 0
        };
        editandoId = descuento_option.id_descuento;
        mostrarModalDescuento = true;
    }
    
    function cancelarEdicion() {
        descuentoEditando = null;
        editandoId = null;
        mostrarModalDescuento = false;
    }
    
    async function guardarPromocion() {
        try {
            const url = editandoId 
                ? `${pathUsuariosMS}/admin/descuentos`
                : `${pathUsuariosMS}/admin/descuentos`;
                
            const method = editandoId ? "PUT" : "POST";
            const body = editandoId ? descuentoEditando : nuevoDescuento;
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify(body)
            });
            
            const result = await response.json();
            
            if (result.success) {
                await obtenerDescuentos();
                mostrarExito(editandoId ? "Descuento editado" : "Descuento creado");
                cancelarEdicion();
            } else {
                throw new Error(result.message || "Error al guardar");
            }
        } catch (error) {
            console.error("Error al guardar descuento:", error);
            mostrarError(error.message);
        }
    }
    
    async function eliminarPromocion(id) {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar Descuento?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Procesando...',
                    html: 'Eliminando descuento',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
                
                const response = await fetch(`${pathUsuariosMS}/admin/descuentos/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': localStorage.getItem('authorization'),
                        'refresh':  localStorage.getItem('refresh')
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    await obtenerDescuentos();
                    mostrarExito("Descuento eliminado");
                } else {
                    throw new Error(data.message || "Error al eliminar");
                }
            }
        } catch (error) {
            console.error("Error al eliminar descuento:", error);
            mostrarError("Error al eliminar descuento");
        }
    }

    // Helpers
    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            timer: 3000
        });
    }
    
    function mostrarExito(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    }
    
    onMount(async () => { 
        await obtenerDescuentos()
    });
</script>

<svelte:head>
    <title>Gestión Descuentos</title>
</svelte:head>

<div class="porcentajes-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Lista de Descuentos</h2>
        <button 
            onclick={() => { 
                descuentoEditando = nuevoDescuento;
                mostrarModalDescuento = true;
            }} 
            class="btn-agregar"
            title="Agregar nuevo producto"
        >
            + Agregar Descuento
        </button>
    </div>

    <table>
        <thead>
            <tr>
                <th>No.</th>
                <th>Porcentaje Descuento</th>
                <th>Rango Mínimo</th>
                <th>Rango Máximo</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each descuentos as descuento}
                <tr>
                    <td>{descuento.id_descuento}</td>
                    <td>{descuento.porcentaje_descuento} %</td>
                    <td>{descuento.rango_compra_min}</td>
                    <td>{descuento.rango_compra_max}</td>
                    <td class="acciones-td">
                        <button onclick={() => iniciarEdicion(descuento)} class="btn-editar" title="Editar">
                            ✏️
                        </button>
                        <button onclick={() => eliminarPromocion(descuento.id_descuento)} class="btn-eliminar" title="Eliminar">
                            🗑️
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<!-- Modal para producto -->
{#if mostrarModalDescuento}
<div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
    <div class="modal-content">
        <button class="close-modal" onclick={cancelarEdicion}>×</button>
        <h3>{editandoId ? 'Editar Descuento' : 'Nuevo Descuento'}</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="rango-min">Rango Mínimo:</label>
                <input id="rango-min" type="number" step="1" class="form-input" bind:value={descuentoEditando.minimo} />
            </div>
            <div class="form-group">
                <label for="rango-max">Rango Máximo:</label>
                <input id="rango-max" type="number" step="1" class="form-input" bind:value={descuentoEditando.maximo} />
            </div>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label for="rango-max">Porcentaje:</label>
                <input id="rango-max" type="number" step="1" class="form-input" bind:value={descuentoEditando.porcentaje} />
            </div>
        </div>
        
        <div class="form-buttons">
            <button onclick={guardarPromocion} class="btn-guardar">
                {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onclick={cancelarEdicion} class="btn-cancelar">
                Cancelar
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    /* Estilos base */
    .porcentajes-container {
        width: 94%;
        margin: auto;
        padding: 20px;
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        max-height: 80vh;
        overflow-y: auto;
    }

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    h2, h3 {
        margin: 0;
        font-size: 20px;
    }

    h3 {
        margin-bottom: 20px;
        text-align: center;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    th, td {
        padding: 10px 5px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }

    th {
        background: var(--header-bg);
        color: var(--header-text);
    }

    tr:hover {
        background: var(--hover-bg);
    }
    
    /* Botones */
    .btn-agregar {
        background: #007bff;
        color: white;
        padding: 5px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
    }

    .btn-agregar:hover {
        background: #0069d9;
    }
    
    .acciones-td {
        display: flex;
        padding: 10px;
        justify-content: center;
    }
    
    button {
        padding: 5px;
        margin-left: 5px;
        margin-right: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-editar {
        background: #ffc107;
        color: #000;
    }
    
    .btn-editar:hover {
        background: #e0a800;
    }
    
    .btn-eliminar {
        background: #dc3545;
        color: white;
    }
    
    .btn-eliminar:hover {
        background: #c82333;
    }
    
    .btn-guardar {
        background: #28a745;
        color: white;
        padding: 10px 20px;
    }
    
    .btn-guardar:hover {
        background: #218838;
    }
    
    .btn-cancelar {
        background: #6c757d;
        color: white;
        padding: 10px 20px;
    }
    
    .btn-cancelar:hover {
        background: #5a6268;
    }
    
    /* Modales */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
    }

    .modal-content {
        background: var(--bg-color);
        padding: 25px;
        border-radius: 10px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .wide-modal {
        max-width: 800px;
    }

    .close-modal {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-color);
        padding: 5px;
    }
    
    /* Formularios */
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .span-2 {
        grid-column: span 2;
    }
    
    .form-group {
        margin-bottom: 10px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .form-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: var(--bg-color);
        color: var(--text-color);
    }
    
    textarea.form-input {
        min-height: 80px;
        resize: vertical;
    }
    
    .form-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    .btn-cancelar {
        background: #6c757d;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .btn-guardar {
        background: #007bff;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .btn-guardar:hover {
        background: #0069d9;
    }

    /* Variables para modo oscuro/claro */
    :root {
        --bg-color: #ffffff;
        --text-color: #000000;
        --header-bg: #516664;
        --header-text: white;
        --hover-bg: #f1f1f1;
    }

    .dark-mode {
        --bg-color: #1f2937;
        --text-color: white;
        --header-bg: #374151;
        --header-text: #ffffff;
        --hover-bg: #2d3748;
    }

    .dark-mode .form-input,
    .dark-mode textarea,
    .dark-mode select {
        border-color: #4b5563;
        background: #1f2937;
        color: white;
    }
    
    .dark-mode .imagen-container {
        border-color: #4b5563;
    }
</style>