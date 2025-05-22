<script>
    import { onMount } from "svelte";
    import { pathPagosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';
    
    // Datos
    let productos = [];
    
    // Carga inicial de datos
    async function obtenerPromocionesProductos() {
        try {
            const resProductos = await fetch(`${pathPagosMS}/pagos`, {
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
            if(dataProductos.message.length === 0) {
                productos = [];
                return;
            }
            if (dataProductos.success) productos = dataProductos.message;
        } catch(e) {
            console.log("Error en la obtención de promociones de productos:", e)
            mostrarError("Error al cargar promociones de productos")
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

    onMount(async () => { 
        await obtenerPromocionesProductos()
    });
</script>

<svelte:head>
    <title>Mis Pagos</title>
</svelte:head>

<div class="productos-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Pagos Realizados</h2>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>ID Compra</th>
                <th>Tarjeta 1</th>
                <th>(%) T1</th>
                <th>No. T1</th>
                <th>Tarjeta 2</th>
                <th>(%) T2</th>
                <th>No. T2</th>
                <th>Fecha Pago</th>
                <th>Descuento</th>
                <th>Sub Total</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            {#each productos as producto}
                <tr>
                    <td>{producto.codigo_pago}</td>
                    <td>{producto.id_compra}</td>
                    <td>{producto.tipo_pago_1}</td>
                    <td>{producto.porcentaje_1}</td>
                    <td>{producto.no_tarjeta_1}</td>
                    <td>{producto.tipo_pago_2}</td>
                    <td>{producto.porcentaje_2 === '0.00' ? 'N/A' : producto.porcentaje_2}</td>
                    <td>{producto.no_tarjeta_2 === null ? 'N/A' : producto.no_tarjeta_2}</td>
                    <td>{producto.fecha_pago}</td>
                    <td>{producto.cupon_descuento === '0.00' ? `N/A` : `${producto.cupon_descuento} %` } </td>
                    <td>{producto.subtotal}</td>
                    <td>{producto.total}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    /* Estilos base */
    .productos-container {
        width: 82%;
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
</style>