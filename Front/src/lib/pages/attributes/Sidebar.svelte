<script>
    import { sidebarOpen } from "../../../stores/store.sidevar";
    import { setCurrentPage } from "../../../stores/page.store";
    import { darkMode } from "../../../stores/store.dark";
    import { Link, navigate } from "svelte-routing";
    import { user } from "../../../stores/auth.store";
    import DashIcon from 'svelte-icons/fa/FaGg.svelte';
    import UserNav from "./nav/UserNav.svelte";
    import AdminNav from "./nav/AdminNav.svelte";
    
</script>

<aside class="sidebar" class:collapsed={$sidebarOpen} class:dark-mode={$darkMode}>
    <nav>
        <div class="menu-section">
            <Link 
                to='/home'
                class="menu-title option-home"
                onclick={(event) => {
                    event.preventDefault();
                    setCurrentPage('/home');
                    navigate('/home');
                }}
            >
                
                <DashIcon /> &nbsp; Dashboard
            </Link>
        </div>

        {#if $user.rol === 'admin'}
            <AdminNav />
        {:else if $user.rol === 'user'}
            <UserNav />
        {/if}
    </nav>
</aside>

<style lang="scss">
    .sidebar {
        width: 250px;
        min-height: 93vh;
        background-color: #e5e7eb;
        padding: 15px;
        transition: width 0.3s ease-in-out, padding 0.3s ease-in-out, opacity 0.0s ease-in-out, background-color 0.3s;
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    .sidebar.collapsed {
        width: 0;
        padding: 0;
        opacity: 0;
        pointer-events: none;
    }

    :global(.option-home) {
        display: flex;
        align-items: center;
        font-size: 16px;
        padding: 10px;
        text-decoration: none;
        color: black;
        transition: background-color 0.3s ease-in-out;
    }

    :global(a.menu-title.option-home svg) {
        width: 25px;
    }

    :global(.option-home:hover) {
        background-color: #d1d5db;
    }

    :global(.dark-mode .option-home) {
        color: white;
    }

    :global(.dark-mode .option-home:hover) {
        background-color: #374151;
    }

    .menu-section {
        margin-bottom: 10px;
    }
    
    .dark-mode {
        background-color: #1f2937;
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