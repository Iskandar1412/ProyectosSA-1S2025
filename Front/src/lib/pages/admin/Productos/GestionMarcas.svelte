<script>
    import { onMount } from "svelte";
    import { pathProductosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';

    let marcas = [];
    let marcaEditando = null;
    let editandoId = null;
    let nuevaCategoria = {
        nombre: ''
    };
    
    async function obtenerMarcas() {
        try {
            const response = await fetch(`${pathProductosMS}/marcas`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            const result = await response.json();
            if (result.success) {
                marcas = result.message;
            }
        } catch (error) {
            console.error("Error al obtener marcas:", error);
            mostrarError("Error al cargar categorías");
        }
    }

    function iniciarEdicion(marca) {
        marcaEditando = {...marca};
        editandoId = marca.id_marca;
    }

    function cancelarEdicion() {
        marcaEditando = null;
        editandoId = null;
    }

    async function guardarEdicion() {
        try {
            const response = await fetch(`${pathProductosMS}/marcas`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({
                    id: editandoId,
                    nombre: marcaEditando.nombre,
                    descripcion: marcaEditando.descripcion
                })
            });

            const result = await response.json();
            
            if (result.success) {
                await obtenerMarcas();
                marcaEditando = null;
                editandoId = null;
                mostrarExito("marca actualizada correctamente");
            } else {
                throw new Error(result.message || "Error al actualizar");
            }
        } catch (error) {
            console.error("Error al editar marca:", error);
            mostrarError(error.message);
        }
    }

    async function eliminarMarca(id) {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar marca?',
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
                    html: 'Eliminando marca',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                const response = await fetch(`${pathProductosMS}/marcas/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': localStorage.getItem('authorization'),
                        'refresh':  localStorage.getItem('refresh')
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    await obtenerMarcas();
                    mostrarExito("marca eliminada correctamente");
                } else {
                    throw new Error(data.message || "Error al eliminar");
                }
            }
        } catch (error) {
            console.error("Error al eliminar marca:", error);
            mostrarError("Error al eliminar marca");
        }
    }

    let mostrarModalAgregar = false;

    function mostrarFormularioAgregar() {
        nuevaCategoria = { nombre: ''};
        mostrarModalAgregar = true;
    }

    function cancelarAgregar() {
        mostrarModalAgregar = false;
    }

    async function agregarMarca() {
        try {
            if (!nuevaCategoria.nombre) {
                mostrarError("El nombre es requerido");
                return;
            }

            const response = await fetch(`${pathProductosMS}/marcas`, {
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
                await obtenerMarcas();
                cancelarAgregar()
                mostrarExito("marca agregada correctamente");
            } else {
                throw new Error(result.message || "Error al agregar");
            }
        } catch (error) {
            console.error("Error al agregar marca:", error);
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

    

    onMount(() => { obtenerMarcas() });
</script>

<svelte:head>
    <title>Gestión Marcas</title>
</svelte:head>

<div class="marcas-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Lista de marcas</h2>
        <button 
            onclick={mostrarFormularioAgregar} 
            class="btn-agregar"
            title="Agregar nueva marca"
        >
            + Agregar Marca
        </button>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID Marca</th>
                <th>Nombre</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each marcas as marca}
                <tr>
                    <td>{marca.id_marca}</td>
                    <td>
                        {#if editandoId === marca.id_marca}
                            <input 
                                type="text" 
                                bind:value={marcaEditando.nombre}
                                class="edit-input"
                            />
                        {:else}
                            {marca.nombre}
                        {/if}
                    </td>
                    <td class="acciones-td">
                        {#if editandoId === marca.id_marca}
                            <button onclick={guardarEdicion} class="btn-guardar">
                                Guardar
                            </button>
                            <button onclick={cancelarEdicion} class="btn-cancelar">
                                Cancelar
                            </button>
                        {:else}
                            <button 
                                onclick={() => iniciarEdicion(marca)} 
                                class="btn-editar"
                                title="Editar marca"
                            >
                                ✏️
                            </button>
                            <button 
                                onclick={() => eliminarMarca(marca.id_marca)} 
                                class="btn-eliminar"
                                title="Eliminar marca"
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
            <h3>Agregar Nueva marca</h3>
            <div class="form-group">
                <label for="nombre">Nombre:</label>
                <input 
                    type="text" 
                    id="nombre" 
                    bind:value={nuevaCategoria.nombre}
                    class="form-input"
                    placeholder="Nombre de la marca"
                />
            </div>
            <div class="form-buttons">
                <button onclick={agregarMarca} class="btn-guardar">
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
    .marcas-container {
        width: 60%;
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
    
    .marcas-container::-webkit-scrollbar {
        width: 5px;
    }

    .marcas-container::-webkit-scrollbar-thumb {
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