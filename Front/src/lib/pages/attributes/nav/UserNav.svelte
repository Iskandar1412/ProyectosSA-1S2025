<script>
    import { writable } from "svelte/store";
    import { sidebarOpen } from "../../../../stores/store.sidevar";
    import FaCogs from 'svelte-icons/fa/FaCogs.svelte';
    import FaAddressBook from 'svelte-icons/fa/FaAddressBook.svelte'
    import FaHeadset from 'svelte-icons/fa/FaHeadset.svelte'
    import FaJediOrder from 'svelte-icons/fa/FaJediOrder.svelte'
    import FaCcVisa from 'svelte-icons/fa/FaCcVisa.svelte'
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
    <button class="menu-title" onclick={() => toggleMenu("productos")}>
        <FaJediOrder /> &nbsp; Productos
    </button>
    {#if $activeMenu === "productos" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/favoritos"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/favoritos");
                        navigate('/favoritos');
                        window.location.reload();
                    }}
                >
                    Favoritos
                </Link>
            </li>
            <li>
                <Link 
                    to="/historial"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/historial");
                        navigate('/historial');
                        window.location.reload();
                    }}
                >
                    Historial Compras
                </Link>
            </li>
            <li>
                <Link 
                    to="/seguimiento"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/seguimiento");
                        navigate('/seguimiento');
                        window.location.reload();
                    }}
                >
                    Seguimiento Productos
                </Link>
            </li>
        </ul>
    {/if}
</div>
<div class="menu-section" class:dark-mode={$darkMode}>
    <button class="menu-title" onclick={() => toggleMenu("quejas")}>
        <FaAddressBook /> &nbsp; Quejas/Devoluciones
    </button>
    {#if $activeMenu === "quejas" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/quejas"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/quejas");
                        navigate('/quejas');
                        window.location.reload();
                    }}
                >
                    Quejas
                </Link>
            </li>
            <li>
                <Link 
                    to="/devoluciones"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/devoluciones");
                        navigate('/devoluciones');
                        window.location.reload();
                    }}
                >
                    Devoluciones
                </Link>
            </li>
        </ul>
    {/if}
</div>
<div class="menu-section" class:dark-mode={$darkMode}>
    <button class="menu-title" onclick={() => toggleMenu("pagos")}>
        <FaCcVisa /> &nbsp; Pagos Realizados
    </button>
    {#if $activeMenu === "pagos" && !($sidebarOpen)}
        <ul class="menu-list" in:slide={{ duration: 200 }} out:slide={{ duration: 200 }}>
            <li>
                <Link 
                    to="/pagos"
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/pagos");
                        navigate('/pagos');
                        window.location.reload();
                    }}
                >
                    Pagos
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