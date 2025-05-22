<script>
    import { onMount } from "svelte";
    import { pathProductosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';

    let categorias = [];
    let categoriaEditando = null;
    let editandoId = null;
    let nuevaCategoria = {
        nombre: '',
        descripcion: ''
    };
    
    async function obtenerCategorias() {
        try {
            const response = await fetch(`${pathProductosMS}/categorias`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            const result = await response.json();
            if (result.success) {
                categorias = result.message;
            }
        } catch (error) {
            console.error("Error al obtener categorias:", error);
            mostrarError("Error al cargar categorías");
        }
    }

    function iniciarEdicion(categoria) {
        categoriaEditando = {...categoria};
        editandoId = categoria.id_categoria;
    }

    function cancelarEdicion() {
        categoriaEditando = null;
        editandoId = null;
    }

    async function guardarEdicion() {
        try {
            const response = await fetch(`${pathProductosMS}/categorias`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({
                    id: editandoId,
                    nombre: categoriaEditando.nombre,
                    descripcion: categoriaEditando.descripcion
                })
            });

            const result = await response.json();
            
            if (result.success) {
                await obtenerCategorias();
                categoriaEditando = null;
                editandoId = null;
                mostrarExito("Categoría actualizada correctamente");
            } else {
                throw new Error(result.message || "Error al actualizar");
            }
        } catch (error) {
            console.error("Error al editar categoría:", error);
            mostrarError(error.message);
        }
    }

    async function eliminarCategoria(id) {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar categoría?',
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
                    html: 'Eliminando categoría',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch(`${pathProductosMS}/categorias/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': localStorage.getItem('authorization'),
                        'refresh':  localStorage.getItem('refresh')
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    await obtenerCategorias();
                    mostrarExito("Categoría eliminada correctamente");
                } else {
                    throw new Error(data.message || "Error al eliminar");
                }
            }
        } catch (error) {
            console.error("Error al eliminar categoría:", error);
            mostrarError("Error al eliminar categoría");
        }
    }

    let mostrarModalAgregar = false;

    function mostrarFormularioAgregar() {
        nuevaCategoria = { nombre: '', descripcion: '' };
        mostrarModalAgregar = true;
    }

    function cancelarAgregar() {
        mostrarModalAgregar = false;
    }

    async function agregarCategoria() {
        try {
            if (!nuevaCategoria.nombre) {
                mostrarError("El nombre es requerido");
                return;
            }

            const response = await fetch(`${pathProductosMS}/categorias`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify(nuevaCategoria)
            });

            const result = await response.json();
            
            if (result.success) {
                await obtenerCategorias();
                cancelarAgregar()
                mostrarExito("Categoría agregada correctamente");
            } else {
                throw new Error(result.message || "Error al agregar");
            }
        } catch (error) {
            console.error("Error al agregar categoría:", error);
            mostrarError(error.message);
        }
    }

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

    

    onMount(() => { obtenerCategorias() });
</script>

<svelte:head>
    <title>Gestión Categorias</title>
</svelte:head>

<div class="categorias-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Lista de Categorias</h2>
        <button 
            onclick={mostrarFormularioAgregar} 
            class="btn-agregar"
            title="Agregar nueva categoría"
        >
            + Agregar Categoría
        </button>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID Categoria</th>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each categorias as categoria}
                <tr>
                    <td>{categoria.id_categoria}</td>
                    <td>
                        {#if editandoId === categoria.id_categoria}
                            <input 
                                type="text" 
                                bind:value={categoriaEditando.nombre}
                                class="edit-input"
                            />
                        {:else}
                            {categoria.nombre}
                        {/if}
                    </td>
                    <td>
                        {#if editandoId === categoria.id_categoria}
                            <input 
                                type="text" 
                                bind:value={categoriaEditando.descripcion}
                                class="edit-input"
                            />
                        {:else}
                            {categoria.descripcion}
                        {/if}
                    </td>
                    <td class="acciones-td">
                        {#if editandoId === categoria.id_categoria}
                            <button onclick={guardarEdicion} class="btn-guardar">
                                Guardar
                            </button>
                            <button onclick={cancelarEdicion} class="btn-cancelar">
                                Cancelar
                            </button>
                        {:else}
                            <button 
                                onclick={() => iniciarEdicion(categoria)} 
                                class="btn-editar"
                                title="Editar categoría"
                            >
                                ✏️
                            </button>
                            <button 
                                onclick={() => eliminarCategoria(categoria.id_categoria)} 
                                class="btn-eliminar"
                                title="Eliminar categoría"
                            >
                                🗑️
                            </button>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
{#if mostrarModalAgregar}
    <div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
        <div class="modal-content">
            <button class="close-modal" onclick={cancelarAgregar}>×</button>
            <h3>Agregar Nueva Categoría</h3>
            <div class="form-group">
                <label for="nombre">Nombre:</label>
                <input 
                    type="text" 
                    id="nombre" 
                    bind:value={nuevaCategoria.nombre}
                    class="form-input"
                    placeholder="Nombre de la categoría"
                />
            </div>
            <div class="form-group">
                <label for="descripcion">Descripción:</label>
                <input 
                    type="text" 
                    id="descripcion" 
                    bind:value={nuevaCategoria.descripcion}
                    class="form-input"
                    placeholder="Descripción (opcional)"
                />
            </div>
            <div class="form-buttons">
                <button onclick={agregarCategoria} class="btn-guardar">
                    Guardar
                </button>
                <button onclick={cancelarAgregar} class="btn-cancelar">
                    Cancelar
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .categorias-container {
        width: 94%;
        margin: auto;
        padding: 20px;
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        max-height: 500px;
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
        margin-bottom: 15px;
        text-align: center;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    th, td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        text-align: left;
        border-radius: 2px;
    }

    th {
        background: var(--header-bg);
        color: var(--header-text);
    }

    tr:hover {
        background: var(--hover-bg);
    }
    
    .categorias-container::-webkit-scrollbar {
        width: 5px;
    }

    .categorias-container::-webkit-scrollbar-thumb {
        background-color: #333;
        border-radius: 10px;
    }

    .btn-agregar {
        background: #007bff;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
    }

    .btn-agregar:hover {
        background: #0069d9;
    }

    .form-group {
        margin-bottom: 15px;
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

    .form-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 15px;
    }

    .acciones-td {
        display: flex;
        gap: 8px;
        justify-content: center;
    }
    
    button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 5px;
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
    }
    
    .btn-guardar:hover {
        background: #218838;
    }
    
    .btn-cancelar {
        background: #6c757d;
        color: white;
    }
    
    .btn-cancelar:hover {
        background: #5a6268;
    }
    
    .edit-input {
        width: 100%;
        padding: 3px 5px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: var(--bg-color);
        color: var(--text-color);
    }

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
        max-width: 500px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative;
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
    }

    .dark-mode .modal-content {
        background: #1f2937;
        border: 1px solid #374151;
    }
    
    :root {
        --bg-color: #ffffff;
        --text-color: #000000;
        --header-bg: #516664;
        --header-text: white;
        --hover-bg: #f1f1f1;
        --form-bg: #f8f9fa;
    }

    .dark-mode {
        --bg-color: #1f2937;
        --text-color: white;
        --header-bg: #374151;
        --header-text: #ffffff;
        --hover-bg: #2d3748;
        --form-bg: #111827;
    }

    .dark-mode .form-input,
    .dark-mode .edit-input {
        border-color: #4b5563;
        background: #1f2937;
        color: white;
    }
</style>