<script>
    import { writable } from "svelte/store";
    import { sidebarOpen } from "../../../../stores/store.sidevar";
    import FaCogs from 'svelte-icons/fa/FaCogs.svelte';
    import FaUserFriends from 'svelte-icons/fa/FaUserFriends.svelte';
    import FaProductHunt from 'svelte-icons/fa/FaProductHunt.svelte';
    import FaCentos from 'svelte-icons/fa/FaCentos.svelte'
    import { slide } from "svelte/transition";
    import { darkMode } from "../../../../stores/store.dark";
    import { Link, navigate } from "svelte-routing";
    import { setCurrentPage } from "../../../../stores/page.store";

    let activeMenu = writable(null);

    function toggleMenu(section) {
        activeMenu.update(current => (current === section ? null : section));
    }
</script>

<div class="menu-section" class:dark-mode={$darkMode}>
    <button class="menu-title" onclick={() => toggleMenu("users")}>
        <FaUserFriends /> &nbsp; Usuarios
    </button>
    {#if $activeMenu === "users" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/usuarios-sistema"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/usuarios-sistema");
                        navigate('/usuarios-sistema');
                        window.location.reload();
                    }}
                >
                    Usuarios en el sistema
                </Link>
            </li>
            <!-- <li><a href="/usuarios-roles">Roles</a></li> -->
            <li>
                <Link 
                    to="/gestion-descuentos"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/gestion-descuentos");
                        navigate('/gestion-descuentos');
                        window.location.reload();
                    }}
                >
                    Gestion Descuentos
                </Link>
            </li>
            <li>
                <Link 
                    to="/crear-cuenta"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/crear-cuenta");
                        navigate('/crear-cuenta');
                        window.location.reload();
                    }}
                >
                    Crear Cuenta
                </Link>
            </li>
        </ul>
    {/if}
</div>
<div class="menu-section" class:dark-mode={$darkMode}>
    <button class="menu-title" onclick={() => toggleMenu("gestionesUsuarios")}>
        <FaCentos /> &nbsp; Gestiones Usuarios
    </button>
    {#if $activeMenu === "gestionesUsuarios" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/seguimiento-productos/admin"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/seguimiento-productos/admin");
                        navigate('/seguimiento-productos/admin');
                        window.location.reload();
                    }}
                >
                    Productos Vendidos
                </Link>
            </li>
            <li>
                <Link 
                    to="/devoluciones/admin"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/devoluciones/admin");
                        navigate('/devoluciones/admin');
                        window.location.reload();
                    }}
                >
                    Devoluciones
                </Link>
            </li>
            <li>
                <Link 
                    to="/usuarios-problemas"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/usuarios-problemas");
                        navigate('/usuarios-problemas');
                        window.location.reload();
                    }}
                >
                    Quejas Usuarios
                </Link>
            </li>
            <li>
                <Link 
                    to="/descuentos-usuarios"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/descuentos-usuarios");
                        navigate('/descuentos-usuarios');
                        window.location.reload();
                    }}
                >
                    Descuentos Usuarios
                </Link>
            </li>
            <!-- <li>
                <Link 
                    to="/pagos-usuarios/admin"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/pagos-usuarios/admin");
                        navigate('/pagos-usuarios/admin');
                        window.location.reload();
                    }}
                >
                    Lista Pagos
                </Link>
            </li> -->
        </ul>
    {/if}
</div>
<div class="menu-section" class:dark-mode={$darkMode}>
    <button class="menu-title" onclick={() => toggleMenu("productos")}>
        <FaProductHunt /> &nbsp; Productos
    </button>
    {#if $activeMenu === "productos" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/admin/gestion-productos"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/admin/gestion-productos");
                        navigate('/admin/gestion-productos');
                        window.location.reload();
                    }}
                >
                    Productos
                </Link>
            </li>
            <li>
                <Link 
                    to="/gestion-promociones"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/gestion-promociones");
                        navigate('/gestion-promociones');
                        window.location.reload();
                    }}
                >
                    Gestión Promociones
                </Link>
            </li>
            <li>
                <Link 
                    to="/promociones-productos"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/promociones-productos");
                        navigate('/promociones-productos');
                        window.location.reload();
                    }}
                >
                    Promociones Productos
                </Link>
            </li>
            <li>
                <Link 
                    to="/admin/gestion-categorias"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/admin/gestion-categorias");
                        navigate('/admin/gestion-categorias');
                        window.location.reload();
                    }}
                >
                    Categorias
                </Link>
            </li>
            <li>
                <Link 
                    to="/admin/gestion-marcas"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/admin/gestion-marcas");
                        navigate('/admin/gestion-marcas');
                        window.location.reload();
                    }}
                >
                    Marcas
                </Link>
            </li>
        </ul>
    {/if}
</div>
<div class="menu-section" class:dark-mode={$darkMode}>
    <button class="menu-title" onclick={() => toggleMenu("settings")}>
        <FaCogs /> &nbsp; Configuración
    </button>
    {#if $activeMenu === "settings" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/configuracion"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/configuracion");
                        navigate('/configuracion');
                        window.location.reload();
                    }}
                >
                    Configuración
                </Link>
            </li>
        </ul>
    {/if}
</div>

<style lang="scss">
    .menu-title {
        width: 100%;
        text-align: left;
        background: none;
        border: none;
        display: flex;
        font-size: 16px;
        padding: 10px;
        cursor: pointer;
        color: black;
        :global(svg) {
            width: 25px;
        }
    }

    .dark-mode .menu-title {
        color: white;
    }

    .menu-title:hover {
        background-color: #d1d5db;
    }

    .dark-mode .menu-title:hover {
        background-color: #374151;
    }

    .menu-list {
        list-style: none;
        padding: 0;
        margin-left: 15px;
        overflow: hidden;
    }

    .menu-list li {
        margin: 5px 0;
    }

    .menu-list li :global(a) {
        text-decoration: none;
        color: black;
        font-size: 14px;
        padding: 8px;
        display: block;
        border-radius: 5px;
    }

    .dark-mode .menu-list li :global(a) {
        color: white;
    }

    .menu-list li :global(a):hover {
        background-color: #d1d5db;
    }

    .dark-mode .menu-list li :global(a):hover {
        background-color: #374151;
    }

    .menu-section {
        margin-bottom: 10px;
    }

    @media (max-width: 768px) {
        .sidebar {
            position: absolute;
            height: 95vh;
            z-index: 100;
            width: 250px;
        }
    }
</style>