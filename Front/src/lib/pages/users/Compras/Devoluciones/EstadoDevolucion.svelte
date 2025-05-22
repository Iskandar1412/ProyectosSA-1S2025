<script>
    import { onMount } from "svelte";
    import { pathDevolucionesMS } from "../../../../../stores/host";
    import Swal from 'sweetalert2';
    let productos = [];
    let productosFiltrados = [];

    let periodoFiltro = 'todos'; // 'todos', '30dias', '6meses', '12meses'
    let ordenPrecio = null; // null, 'asc', 'desc'
    let ordenFecha = 'desc'; // 'asc', 'desc'
    let precioMin = '';
    let precioMax = '';

    async function obtenerProductos() {
        try {
            const resProductos = await fetch(`${pathDevolucionesMS}/devoluciones`, {
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
                productos.sort((a, b) => new Date(b.fecha_devolucion).getTime() - new Date(a.fecha_devolucion).getTime());
                aplicarFiltros();
            }
        } catch (e) {
            console.log("Error en la obtención de productos:", e);
            mostrarError(e.message);
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
                return new Date(producto.fecha_devolucion) >= fechaLimite;
            });
        }
        
        if (precioMin || precioMax) {
            productosTemp = productosTemp.filter(producto => {
                const precio = producto.precio_producto;
                return (!precioMin || precio >= parseFloat(precioMin)) &&
                       (!precioMax || precio <= parseFloat(precioMax));
            });
        }
        
        if (ordenPrecio) {
            productosTemp.sort((a, b) => {
                return ordenPrecio === 'asc' 
                    ? a.precio_producto - b.precio_producto 
                    : b.precio_producto - a.precio_producto;
            });
        } else if (ordenFecha) {
            productosTemp.sort((a, b) => {
                return ordenFecha === 'desc' 
                    ? new Date(b.fecha_devolucion).getTime() - new Date(a.fecha_devolucion).getTime()
                    : new Date(a.fecha_devolucion).getTime() - new Date(b.fecha_devolucion).getTime();
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

    onMount(async () => {
        await obtenerProductos();
    });
</script>

<div class="header-container">
    <h2>Devoluciones</h2>
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
                <th># Devolucion</th>
                <th>Cod Producto</th>
                <th>Motivo</th>
                <th>Fecha Devolucion</th>
                <th>Precio Unitario</th>
                <th>Cantidad Ordenada</th>
                <th>Total</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            {#each productosFiltrados as producto}
                <tr>
                    <td>{producto.id_devolucion}</td>
                    <td>{producto.codigo_producto}</td>
                    <td>{producto.motivo_devolucion}</td>
                    <td>{producto.fecha_devolucion}</td>
                    <td>{producto.precio_producto}</td>
                    <td>{producto.cantidad}</td>
                    <td>{producto.precio_total}</td>
                    <td>{producto.estado}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

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

    h2 {
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