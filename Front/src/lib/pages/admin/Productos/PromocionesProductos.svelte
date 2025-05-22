<script>
    import { onMount } from "svelte";
    import { pathProductosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';
    
    // Datos
    let productos = [];
    let promociones = [];
    let productosLista = [];
    let productoEditando = null;
    let editandoId = null;

    // Estados modales
    let mostrarModalProducto = false;

    // Formularios
    let nuevoProducto = {
        nombre_producto: '',
        fecha_inicio: '',
        fecha_fin: '',
        id_producto: 0,
        id_promocion: 0,
        id_promocion_producto: 0,
        porcentaje: ''
    };
    
    // Carga inicial de datos
    async function obtenerPromocionesProductos() {
        try {
            const resProductos = await fetch(`${pathProductosMS}/promociones/producto`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            if(!resProductos.ok) {
                throw new Error('Error en la petición')
            }
    
            const dataProductos = await resProductos.json();
            if (dataProductos.success) productos = dataProductos.message;
        } catch(e) {
            console.log("Error en la obtención de promociones de productos:", e)
            mostrarError("Error al cargar promociones de productos")
        }
    }

    async function obtenerDatos() {
        try {
            const [resProductos, resPromociones] = await Promise.all([
                fetch(`${pathProductosMS}/productos`, { headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } }),
                fetch(`${pathProductosMS}/promociones`, { headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } }),
            ]);
            
            const dataProductos = await resProductos.json();
            const dataPromociones = await resPromociones.json();
            if (dataProductos.success) productosLista = dataProductos.message;
            if (dataPromociones.success) promociones = dataPromociones.message;
        } catch (error) {
            console.error("Error al obtener datos:", error);
            mostrarError("Error al cargar datos");
        }
    }

    // Productos
    function iniciarEdicion(producto) {
        productoEditando = {
            nombre_producto: producto.nombre_producto || '',
            fecha_inicio: producto.fecha_inicio,
            fecha_fin: producto.fecha_fin,
            id_producto: Number(producto.id_producto) || 0,
            id_promocion: Number(producto.id_promocion) || 0,
            id_promocion_producto: Number(producto.id_promocion_producto),
            porcentaje: producto.porcentaje
        };
        editandoId = producto.id_producto;
        mostrarModalProducto = true;
    }
    
    function cancelarEdicion() {
        productoEditando = null;
        editandoId = null;
        mostrarModalProducto = false;
    }
    
    async function guardarProducto() {
        try {
            const url = editandoId 
                ? `${pathProductosMS}/promociones/producto`
                : `${pathProductosMS}/promociones/producto`;
                
            const method = editandoId ? "PUT" : "POST";
            const body = editandoId ? productoEditando : nuevoProducto;

            if(new Date(body.fecha_fin) < new Date(body.fecha_inicio)) {
                mostrarError("La fecha final debe ser posterior a la inicial")
                return
            }

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
                await obtenerPromocionesProductos();
                mostrarExito(editandoId ? "Producto actualizado" : "Producto creado");
                cancelarEdicion();
            } else {
                throw new Error(result.message || "Error al guardar");
            }
        } catch (error) {
            console.error("Error al guardar promocíon del producto:", error);
            mostrarError(error.message);
        }
    }
    
    async function eliminarPromocionProducto(id) {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar promoción de producto?',
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
                    html: 'Eliminando promoción',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
                
                const response = await fetch(`${pathProductosMS}/promociones/producto/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': localStorage.getItem('authorization'),
                        'refresh':  localStorage.getItem('refresh')
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    await obtenerPromocionesProductos();
                    mostrarExito("Promoción eliminada");
                } else {
                    throw new Error(data.message || "Error al eliminar");
                }
            }
        } catch (error) {
            console.error("Error al eliminar promoción:", error);
            mostrarError("Error al eliminar promoción");
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
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString();
    }
    
    onMount(async () => { 
        await obtenerPromocionesProductos()
        await obtenerDatos()
    });
</script>

<svelte:head>
    <title>Promociones de Productos</title>
</svelte:head>

<div class="productos-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Lista de Promociones de Productos</h2>
        <button 
            onclick={() => { 
                productoEditando = nuevoProducto;
                mostrarModalProducto = true;
            }} 
            class="btn-agregar"
            title="Agregar nueva promoción producto"
        >
            + Agregar Promoción Producto
        </button>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre Producto</th>
                <th>Porcentaje Promocion</th>
                <th>Fecha Inicio</th>
                <th>Fecha Final</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each productos as producto}
                <tr>
                    <td>{producto.id_promocion_producto}</td>
                    <td>{producto.nombre_producto}</td>
                    <td>{producto.porcentaje} %</td>
                    <td>{formatearFecha(producto.fecha_inicio)}</td>
                    <td>{formatearFecha(producto.fecha_fin)}</td>
                    <td class="acciones-td">
                        <button onclick={() => iniciarEdicion(producto)} class="btn-editar" title="Editar">
                            ✏️
                        </button>
                        <button onclick={() => eliminarPromocionProducto(producto.id_promocion_producto)} class="btn-eliminar" title="Eliminar">
                            🗑️
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<!-- Modal para producto -->
{#if mostrarModalProducto}
<div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
    <div class="modal-content">
        <button class="close-modal" onclick={cancelarEdicion}>×</button>
        <h3>{editandoId ? 'Editar Promoción Producto' : 'Nueva Promoción Producto'}</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="nombres">Producto:</label>
                <select
                    id="nombres"
                    disabled={editandoId}
                    class="form-input"
                    bind:value={productoEditando.id_producto}
                >
                    <option value={0}>Seleccione...</option>
                    {#each productosLista as prod}
                        <option value={prod.id_producto}>{prod.nombre}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-group">
                <label for="promociones">Promociones:</label>
                <select
                    id="promociones"
                    class="form-input"
                    bind:value={productoEditando.id_promocion}
                >
                    <option value={0}>Seleccione...</option>
                    {#each promociones as prom}
                        <option value={prom.id_promocion}>{prom.porcentaje}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-group">
                <label for="valor">Fecha Inicio:</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="date" 
                    bind:value={productoEditando.fecha_inicio}
                    required
                />
            </div>
            
            <div class="form-group">
                <label for="valor">Fecha Fin:</label>
                <input 
                    class="form-input"
                    id="fecha-fin" 
                    type="date" 
                    bind:value={productoEditando.fecha_fin}
                    required
                />
            </div>
        </div>
        
        <div class="form-buttons">
            <button onclick={guardarProducto} class="btn-guardar">
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
    .productos-container {
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
    
    .btn-imagenes {
        background: #17a2b8;
        color: white;
    }
    
    .btn-imagenes:hover {
        background: #138496;
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
</style>