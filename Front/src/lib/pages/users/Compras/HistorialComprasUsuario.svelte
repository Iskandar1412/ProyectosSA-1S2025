<script>
    import { onMount } from "svelte";
    import { pathComprasMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
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
            const resProductos = await fetch(`${pathComprasMS}/historial`, {
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

    // Helpers
    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            timer: 3000
        });
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

    onMount(async () => {
        await obtenerProductos();
    });
</script>

<svelte:head>
    <title>Historial de Compras</title>
</svelte:head>

<div class="productos-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Historial de Compras</h2>
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

    <table>
        <thead>
            <tr>
                <th># Orden</th>
                <th>Cod Producto</th>
                <th>Precio Unitario</th>
                <th>Descuento Producto</th>
                <th>Fecha Orden</th>
                <th>Cantidad Ordenada</th>
            </tr>
        </thead>
        <tbody>
            {#each productosFiltrados as producto}
                <tr>
                    <td>{producto.id_orden}</td>
                    <td>{producto.codigo_producto}</td>
                    <td>{producto.precio_unitario}</td>
                    <td>{producto.promocion === 0 ? `N/A` : `${producto.promocion} %`}</td>
                    <td>{new Date(producto.fecha_orden).toLocaleDateString()}</td>
                    <td>{producto.cantidad}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .productos-container {
        width: 80%;
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

    h2 {
        margin: 0;
        font-size: 20px;
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
    
    :root {
        --bg-color: #ffffff;
        --text-color: #000000;
        --header-bg: #516664;
        --header-text: white;
        --hover-bg: #f1f1f1;
        --button-bg: #e0e0e0;
        --button-active: #516664;
        --button-text: #333;
        --button-active-text: white;
    }

    .dark-mode {
        --bg-color: #1f2937;
        --text-color: white;
        --header-bg: #374151;
        --header-text: #ffffff;
        --hover-bg: #2d3748;
        --button-bg: #374151;
        --button-active: #4B5563;
        --button-text: #E5E7EB;
        --button-active-text: white;
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
