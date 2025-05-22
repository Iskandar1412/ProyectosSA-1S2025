<script>
    import { onMount } from "svelte";
    import { pathComprasMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';
    
    // Datos
    let productos = [];
    
    let productosLista = [
        { id: 'PENDIENTE', estado: 'PENDIENTE' },
        { id: 'PROCESANDO', estado: 'PROCESANDO' },
        { id: 'ENVIADO', estado: 'ENVIADO' },
        { id: 'ADUANAS', estado: 'ADUANAS' },
        { id: 'ENTREGADO', estado: 'ENTREGADO' }
    ];
    let productoEditando = null;
    let editandoId = null;

    // Estados modales
    let mostrarModalProducto = false;
    
    // Carga inicial de datos
    async function obtenerPromocionesProductos() {
        try {
            const resProductos = await fetch(`${pathComprasMS}/compras/admin`, {
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

    // Productos
    function iniciarEdicion(producto) {
        productoEditando = producto
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
            const url = `${pathComprasMS}/compras`;
                
            const method = "PUT" ;
            const body = productoEditando;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ id_orden: body.id_orden, estado: body.estado })
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
    });
</script>

<svelte:head>
    <title>Seguimiento Compras Usuarios</title>
</svelte:head>

<div class="productos-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Estado Compras Usuarios</h2>
    </div>

    <table>
        <thead>
            <tr>
                <th>No Orden</th>
                <th>Sub Total</th>
                <th>Descuento</th>
                <th>Total</th>
                <th>Fecha Orden</th>
                <th>Estado</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each productos as producto}
                <tr>
                    <td>{producto.id_orden}</td>
                    <td>{producto.subtotal}</td>
                    <td>{producto.cupon_descuento === 0 ? `N/A` : `${producto.cupon_descuento} %` } </td>
                    <td>{producto.total}</td>
                    <td>{formatearFecha(producto.fecha_orden)}</td>
                    <td>{producto.estado}</td>
                    <td class="acciones-td">
                        <button onclick={() => iniciarEdicion(producto)} class="btn-editar" title="Editar">
                            ✏️
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
        <h3>Editar Promoción Producto Orden [ {productoEditando.id_orden} ]</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="valor">Cupon Descuento:</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="text"
                    disabled
                    value={productoEditando.cupon_descuento === 0 ? `N/A` : `${productoEditando.cupon_descuento} %` }
                    required
                />
            </div>

            <div class="form-group">
                <label for="valor">Total ($):</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="text"
                    disabled 
                    value={productoEditando.total}
                    required
                />
            </div>
            
            <div class="form-group">
                <label for="valor">Fecha Orden:</label>
                <input 
                    class="form-input"
                    id="fecha-fin" 
                    type="date" 
                    disabled
                    bind:value={productoEditando.fecha_orden}
                    required
                />
            </div>

            <div class="form-group">
                <label for="nombres">Estado:</label>
                <select
                    id="nombres"
                    class="form-input"
                    disabled={productoEditando.estado === 'ENTREGADO'}
                    bind:value={productoEditando.estado}
                >
                    <option value={0}>Seleccione...</option>
                    {#each productosLista as prod}
                        <option value={prod.id}>{prod.estado}</option>
                    {/each}
                </select>
            </div>
        </div>

        <div class="form-compras">
            <label for="valor">Productos:</label>
            <div class="contenedor-compras">
                <table>
                    <thead>
                        <tr>
                            <th>Codigo</th>
                            <th>Precio Unitario</th>
                            <th>Promocion</th>
                            <th>Cantidad</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each productoEditando.productos as partes}
                            <tr>
                                <td>{partes.codigo_producto}</td>
                                <td>{partes.precio_unitario}</td>
                                <td>{partes.promocion === 0 ? 'N/A' : `${partes.promocion} %`} </td>
                                <td>{partes.cantidad}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
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

    .form-compras {
        display: block;
        margin-bottom: 20px;
    }

    .contenedor-compras {
        overflow-y: auto;
        height: 150px;
    }

    .contenedor-compras::-webkit-scrollbar {
        width: 2px; 
    }

    .contenedor-compras::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .contenedor-compras::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 50px;
    }

    .contenedor-compras::-webkit-scrollbar-thumb:hover {
        background: #555;
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
    .dark-mode select {
        border-color: #4b5563;
        background: #1f2937;
        color: white;
    }
</style>