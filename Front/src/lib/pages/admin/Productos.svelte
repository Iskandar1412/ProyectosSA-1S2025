<script>
    import { onMount } from "svelte";
    import TablaProductos from "../../components/Admin/Productos/TablaProductos.svelte";  // Tabla de productos
    import FormularioProducto from "../../components/Admin/Productos/FormularioProductos.svelte";  // Formulario de productos
    import { pathProductosMS } from "../../../stores/host";
    import { validateUser } from "../../../stores/auth.store";
    import { navigate } from "svelte-routing";

    let producto = null; // Producto seleccionado para editar
    let mostrarFormulario = false; // Controlar si mostramos el formulario de productos
    let productos = [];  // Lista de productos
    let categorias = [];  // Lista de categorías
    let marcas = [];  // Lista de marcas
    let loading = false;
    let message = "";

    // Función para alternar la visibilidad del formulario
    function toggleFormulario() {
        mostrarFormulario = !mostrarFormulario;
        if (!mostrarFormulario) {
            producto = null; // Limpiar la variable 'producto' al cerrar el formulario
        }
    }

    onMount(async () => {
        const user = await validateUser();
        if (!user) {
           navigate("/"); // Si no hay usuario, redirigir al inicio
        }

        if (user.rol !== "admin") {
            navigate("/"); // Si el usuario no es admin, redirigir al inicio
        }

        obtenerProductos(); // Obtener los productos al montar el componente
        obtenerCategorias(); // Obtener las categorías al montar el componente
        obtenerMarcas(); // Obtener las marcas al montar el componente
    });

    function handleUpdate(prod) {
        producto = prod;
        toggleFormulario(); // Mostrar el formulario para editar el producto
    }

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
                categorias = result.data;
            } else {
                message = "No se pudieron obtener las categorías.";
            }
        } catch (error) {
            message = "Error al obtener las categorías.";
        }
    }

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
                marcas = result.data;
            } else {
                message = "No se pudieron obtener las marcas.";
            }
        } catch (error) {
            message = "Error al obtener las marcas.";
        }
    }

    // Obtener productos desde el backend
    async function obtenerProductos() {
        loading = true;
        try {
            const response = await fetch(`${pathProductosMS}/productos/admin`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });
            const result = await response.json();
            if (result.success) {
                productos = result.message;
            } else {
                message = "No se pudieron obtener los productos.";
            }
        } catch (error) {
            message = "Error al obtener los productos.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="wrapper">
    <div class="container">
        {#if !mostrarFormulario}
        <h1><strong>Gestión de Productos</strong></h1>

        {#if message}
            <p class="message">{message}</p>
        {/if}

        
        <div style="display: flex; justify-content: space-between; align-items: center;padding-bottom: 1rem;">
            <!-- Botón para mostrar/ocultar el formulario -->
            <button
                class={mostrarFormulario ? "red-button" : "green-button"}
                on:click={toggleFormulario}
            >
                {mostrarFormulario ? "Cancelar" : "Agregar Producto"}
            </button>
        </div>
        {/if}

        <!-- El formulario solo se muestra si 'mostrarFormulario' es verdadero -->
        {#if mostrarFormulario}
            <FormularioProducto {obtenerProductos} {toggleFormulario} {producto} {categorias} {marcas} />
        {/if}

        <!-- Tabla con los productos se oculta si 'mostrarFormulario' es verdadero -->
        {#if !mostrarFormulario}
            <TablaProductos {productos} {obtenerProductos} {handleUpdate} />
        {/if}
    </div>
</div>

<style>
    .wrapper {
        display: flex;
        justify-content: center;
        margin: auto;
    }

    .container {
        margin-top: 45px;
        padding: 20px;
        min-height: 90%;
        max-height: 90%;
        background: #1e1e1e;
        color: white;
        border-radius: 12px;
        text-align: center;
        border-color: #2c2c2c;
        border-style: solid;
        border-width: 3px;
    }

    .green-button {
        background: #16725b;
        color: #00cc66;
    }

    .green-button:hover {
        background: #4eee9e;
        color: white;
    }

    .red-button {
        background: #ff3333;
        color: white;
    }

    .red-button:hover {
        background: #a61d1d;
        color: white;
    }

    .message {
        margin-top: 10px;
        font-size: 14px;
        color: #ffcc00;
    }
</style>
