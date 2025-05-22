<script>
    import { onMount } from "svelte";
    import { pathComprasMS, pathDevolucionesMS } from "../../../../../stores/host";
    import Swal from 'sweetalert2';
    import { darkMode } from "../../../../../stores/store.dark";
    import { user } from "../../../../../stores/auth.store";

    let productos = [];
    let productosFiltrados = [];
    let productoEditando = null;
    let editandoId = null;
    let ProductoDevolucion = { correo_usuario: '', id_producto: 0, codigo_producto: 0, fecha: '', cantidad: 0, motivo_devolucion: '', precio_producto: 0 }

    // Estados modales
    let mostrarModalProducto = false;

    let periodoFiltro = 'todos'; // 'todos', '30dias', '6meses', '12meses'
    let ordenPrecio = null; // null, 'asc', 'desc'
    let ordenFecha = 'desc'; // 'asc', 'desc'
    let precioMin = '';
    let precioMax = '';

    async function obtenerProductos() {
        try {
            const resProductos = await fetch(`${pathComprasMS}/historial-dev`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            if (!resProductos.ok) {
                throw new Error('Error en la petición');
            }

            const dataProductos = await resProductos.json();
            if (dataProductos.success) {
                productos = dataProductos.message;
                productos.sort((a, b) => new Date(b.fecha_orden).getTime() - new Date(a.fecha_orden).getTime());
                aplicarFiltros();
            }
        } catch (e) {
            console.log("Error en la obtención de productos:", e);
            mostrarError("Error al cargar productos");
        }
    }

    function aplicarFiltros() {
        const hoy = new Date();
        let productosTemp = [...productos];
        
        if (periodoFiltro !== 'todos') {
            let fechaLimite = new Date();
            
            switch (periodoFiltro) {
                case '30dias':
                    fechaLimite.setDate(fechaLimite.getDate() - 30);
                    break;
                case '6meses':
                    fechaLimite.setMonth(fechaLimite.getMonth() - 6);
                    break;
                case '12meses':
                    fechaLimite.setMonth(fechaLimite.getMonth() - 12);
                    break;
            }
            
            productosTemp = productosTemp.filter(producto => {
                return new Date(producto.fecha_orden) >= fechaLimite;
            });
        }
        
        if (precioMin || precioMax) {
            productosTemp = productosTemp.filter(producto => {
                const precio = producto.precio_unitario;
                return (!precioMin || precio >= parseFloat(precioMin)) &&
                       (!precioMax || precio <= parseFloat(precioMax));
            });
        }
        
        if (ordenPrecio) {
            productosTemp.sort((a, b) => {
                return ordenPrecio === 'asc' 
                    ? a.precio_unitario - b.precio_unitario 
                    : b.precio_unitario - a.precio_unitario;
            });
        } else if (ordenFecha) {
            productosTemp.sort((a, b) => {
                return ordenFecha === 'desc' 
                    ? new Date(b.fecha_orden).getTime() - new Date(a.fecha_orden).getTime()
                    : new Date(a.fecha_orden).getTime() - new Date(b.fecha_orden).getTime();
            });
        }
        
        productosFiltrados = productosTemp;
    }

    function toggleOrdenPrecio() {
        if (ordenPrecio === null) {
            ordenPrecio = 'desc';
        } else if (ordenPrecio === 'desc') {
            ordenPrecio = 'asc';
        } else {
            ordenPrecio = null;
        }
        ordenFecha = null;
        aplicarFiltros();
    }

    function toggleOrdenFecha() {
        if (ordenFecha === 'desc') {
            ordenFecha = 'asc';
        } else {
            ordenFecha = 'desc';
        }
        ordenPrecio = null;
        aplicarFiltros();
    }

    function resetearFiltros() {
        periodoFiltro = 'todos';
        ordenPrecio = null;
        ordenFecha = 'desc';
        precioMin = '';
        precioMax = '';
        aplicarFiltros();
    }

    // Productos
    function iniciarDevolucion(producto) {
        if(producto.promocion !== 0) {
            mostrarError('No se puede hacer peticion de devolución de un producto con descuento')
            return;
        }
        ProductoDevolucion.codigo_producto = producto.codigo_producto
        ProductoDevolucion.fecha = producto.fecha_orden
        ProductoDevolucion.correo_usuario = $user.correo
        ProductoDevolucion.id_producto = producto.id_producto
        ProductoDevolucion.precio_producto = producto.precio_unitario
        productoEditando = producto
        editandoId = producto.id_producto;
        mostrarModalProducto = true;
    }

    async function realizarPedidoDevolucion() {
        if(ProductoDevolucion.cantidad > productoEditando.cantidad) {
            mostrarError('No se puede poner una mayor cantidad en el pedido')
            return
        }

        if(ProductoDevolucion.cantidad <= 0) {
            mostrarError('No se puede hacer una devolución con 0 o menor a 0')
            return
        }

        try {
            const data = await fetch(`${pathDevolucionesMS}/devoluciones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify(ProductoDevolucion)
            })

            const response = await data.json()

            if(!data.ok) {
                mostrarError(response.message)
                return
            }

            if(response.success) {
                mostrarExito(response.message)
                cancelarEdicion()
            }
        } catch (e) {
            console.log(e)
            mostrarError(e.message)
        }
    }
    
    function cancelarEdicion() {
        productoEditando = null;
        editandoId = null;
        ProductoDevolucion = { correo_usuario: '', id_producto: 0, codigo_producto: 0, fecha: '', cantidad: 0, motivo_devolucion: '', precio_producto: 0 }
        mostrarModalProducto = false;
    }
    
    // Helpers
    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            timer: 3000,
            showConfirmButton: false
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
        await obtenerProductos();
    });
</script>

<div class="header-container">
    <h2>Productos</h2>
</div>
<div class="filtros-container">
    <div class="filtros-horizontal">
        <div class="filtro-periodo">
            <button class:active={periodoFiltro === 'todos'} onclick={() => { periodoFiltro = 'todos'; aplicarFiltros(); }}>
                Todos
            </button>
            <button class:active={periodoFiltro === '30dias'} onclick={() => { periodoFiltro = '30dias'; aplicarFiltros(); }}>
                30 días
            </button>
            <button class:active={periodoFiltro === '6meses'} onclick={() => { periodoFiltro = '6meses'; aplicarFiltros(); }}>
                6 meses
            </button>
            <button class:active={periodoFiltro === '12meses'} onclick={() => { periodoFiltro = '12meses'; aplicarFiltros(); }}>
                12 meses
            </button>
        </div>
        
        <div class="filtro-rango">
            <input type="number" bind:value={precioMin} min="0" step="0.1" placeholder="Precio mínimo">
            <span>a</span>
            <input type="number" bind:value={precioMax} min={precioMin || 0} step="0.1" placeholder="Precio máximo">
            <button onclick={aplicarFiltros}>Aplicar</button>
        </div>
        
        <div class="filtro-orden">
            <button class:active={ordenPrecio !== null} onclick={toggleOrdenPrecio}>
                {ordenPrecio === null ? 'Precio' : ordenPrecio === 'asc' ? 'Precio ↑' : 'Precio ↓'}
            </button>
            <button class:active={ordenFecha !== null} onclick={toggleOrdenFecha}>
                {ordenFecha === 'asc' ? 'Fecha ↑' : 'Fecha ↓'}
            </button>
        </div>
        
        <button onclick={resetearFiltros} class="btn-reset">Resetear</button>
    </div>
</div>
<div class='table-container'>
    <table>
        <thead>
            <tr>
                <th># Orden</th>
                <th>Cod Producto</th>
                <th>Precio Unitario</th>
                <th>Descuento Producto</th>
                <th>Fecha Orden</th>
                <th>Cantidad Ordenada</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each productosFiltrados as producto}
                <tr>
                    <td>{producto.id_orden}</td>
                    <td>{producto.codigo_producto}</td>
                    <td>{producto.precio_unitario}</td>
                    <td>{producto.promocion === 0 ? `N/A` : `${producto.promocion} %`}</td>
                    <td>{producto.fecha_orden}</td>
                    <td>{producto.cantidad}</td>
                    <td class="acciones-td">
                        <button onclick={() => iniciarDevolucion(producto)} class="btn-editar" title="Opcion de Devolución">
                            ↩️📦
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

{#if mostrarModalProducto}
<div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
    <div class="modal-content">
        <button class="close-modal" onclick={cancelarEdicion}>×</button>
        <h3>Devolucion Orden [ {productoEditando.id_orden} ]</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="valor">COD:</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="text"
                    disabled
                    value={productoEditando.codigo_producto}
                    required
                />
            </div>

            <div class="form-group">
                <label for="valor">Precio Unitario ($):</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="text"
                    disabled 
                    value={productoEditando.precio_unitario}
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
                <label for="nombres">Cantidad:</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="text"
                    disabled 
                    value={productoEditando.cantidad}
                    required
                />
            </div>
        </div>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="nombres">Cantidad Devolucion:</label>
                <input 
                    class="form-input"
                    id="fecha-inicio" 
                    type="text" 
                    bind:value={ProductoDevolucion.cantidad}
                    required
                />
            </div>

            <div class="form-group">
                <label for="nombres">Motivo Devolución:</label>
                <select 
                    class="form-input"
                    bind:value={ProductoDevolucion.motivo_devolucion}
                >
                    <option value="">Seleccione...</option>
                    <option value="Error en el pedido">Error en el pedido</option>
                    <option value="Producto desperfecto o defectuoso">Producto desperfecto o defectuoso</option>
                    <option value="Producto no coincide con la descripcion">Producto no coincide con la descripcion</option>
                    <option value="Arrepentimiento o cambio de opinión">Arrepentimiento o cambio de opinión</option>
                    <option value="Problemas tecnicos o de compatibilidad">Problemas tecnicos o de compatibilidad</option>
                    <option value="Regalo no deseado o duplicado">Regalo no deseado o duplicado</option>
                    <option value="Alergias o intolerancias">Alergias o intolerancias</option>
                    <option value="Embalaje abierto o faltan piezas">Embalaje abierto o faltan piezas</option>
                </select>
            </div>
        </div>

        
        <div class="form-buttons">
            <button onclick={realizarPedidoDevolucion} class="btn-guardar">
                Pedir Devolucion
            </button>
            <button onclick={cancelarEdicion} class="btn-cancelar">
                Cerrar
            </button>
        </div>
    </div>
</div>
{/if}

<style>
    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    h2 {
        margin: 0;
        font-size: 20px;
    }

    .table-container{
        overflow-y: auto;
        max-height: 48vh;
        width: 100%;
    }

    .table-container::-webkit-scrollbar {
        width: 2px; 
    }

    .table-container::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .table-container::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 50px;
    }

    .table-container::-webkit-scrollbar-thumb:hover {
        background: #555;
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

    .filtros-container {
        margin-bottom: 20px;
    }
    
    .filtros-horizontal {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 10px;
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
        text-align: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
    }

    .btn-guardar {
        background: #28a745;
        color: white;
        padding: 10px 20px;
    }
    
    .btn-guardar:hover {
        background: #218838;
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

    h2, h3 {
        margin: 0;
        font-size: 20px;
    }
    
    button {
        padding: 6px 12px;
        border: none;
        border-radius: 4px;
        background-color: var(--button-bg);
        color: var(--button-text);
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
    }
    
    button:hover {
        opacity: 0.9;
    }
    
    button.active {
        background-color: var(--button-active);
        color: var(--button-active-text);
    }
    
    .filtro-periodo, .filtro-orden {
        display: flex;
        gap: 8px;
    }
    
    .filtro-rango {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .filtro-rango input {
        width: 100px;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }

    .acciones-td {
        display: flex;
        padding: 10px;
        justify-content: center;
    }
    
    .btn-reset {
        margin-left: auto;
        background-color: #f44336;
        color: white;
    }
    
    @media (max-width: 768px) {
        .filtros-horizontal {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
        }
        
        .filtro-periodo, .filtro-orden, .filtro-rango {
            flex-wrap: wrap;
        }
        
        .btn-reset {
            margin-left: 0;
            width: 100%;
        }
    }
</style>