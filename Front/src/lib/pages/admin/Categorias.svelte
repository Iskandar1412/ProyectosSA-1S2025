<script>
    import { onMount } from "svelte";
    import TablaCategorias from "../../components/TablaCategorias.svelte";
    import FormularioCategoria from "../../components/FormularioCategorias.svelte";
    import { pathProductosMS } from "../../../stores/host";
    import { validateUser } from "../../../stores/auth.store";
    import { navigate } from "svelte-routing";

    let tempEmail = "";
    let tempTelefono = "";
    let tempDirecciones = [];
    let categoria = null;

    // Variable para controlar si el formulario se muestra o no
    let mostrarFormulario = false;

    // Función para alternar la visibilidad del formulario
    function toggleFormulario() {
        mostrarFormulario = !mostrarFormulario;
        if (!mostrarFormulario) {
            categoria = null;
        }
    }

    onMount(async() => {
        const user = await validateUser();
        if (!user) {
           navigate("/"); // Si no hay usuario, redirigir al inicio
        }

        if (user.rol !== "admin") {
            navigate("/"); // Si el usuario no es admin, redirigir al inicio
        }

        tempEmail = user.correo;
        tempTelefono = user.telefono;
        tempDirecciones = user.direcciones;
        obtenerCategorias();
    });

    function handleUpdate(cat) {
        categoria = cat;
        toggleFormulario();
    }

    let categorias = [];
    let loading = false;
    let message = "";

    // Obtener categorías desde el backend
    async function obtenerCategorias() {
        loading = true;
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
        } finally {
            loading = false;
        }
    }
</script>

<div class="wrapper">
    <div class="container">
        <h1><strong>Gestión de Categorías</strong></h1>

        {#if message}
            <p class="message">{message}</p>
        {/if}
        {#if !mostrarFormulario}
        <div style="display: flex; justify-content: space-between; align-items: center;padding-bottom: 1rem;">
            <!-- Botón para mostrar/ocultar el formulario -->
            <button
                class={mostrarFormulario ? "red-button" : "green-button"}
                on:click={toggleFormulario}
            >
                {mostrarFormulario ? "Cancelar" : "Agregar"}
            </button>
        </div>
        {/if}

        <!-- El formulario solo se muestra si mostrarFormulario es verdadero -->
        {#if mostrarFormulario}
            <FormularioCategoria {obtenerCategorias} {toggleFormulario} {categoria}/>
        {/if}

        <!-- Tabla con las categorías se oculta si mostrarFormulario es verdadero -->
        {#if !mostrarFormulario}
            <TablaCategorias {categorias} {obtenerCategorias}  {handleUpdate} />
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
