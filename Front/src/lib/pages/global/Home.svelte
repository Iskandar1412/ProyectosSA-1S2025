<script>
    import { handlePage, setCurrentPage } from "../../../stores/page.store";
    import { isAuthenticated, logoutUser, user } from "../../../stores/auth.store";
    import { sidebarOpen } from "../../../stores/store.sidevar";
    import { darkMode } from "../../../stores/store.dark";
    import { navigate } from "svelte-routing";
    import { onMount } from "svelte";
    // import Catalogo from "../Catalogo.svelte";
    import CatalogoProductos from "./CatalogoProductos.svelte";
    
    onMount(() => {
        if($isAuthenticated === false) {
            logoutUser()
            setCurrentPage('/');
            navigate('/');
        }
        handlePage();
    });
</script>

<svelte:head>
    {#if !($isAuthenticated)}
    <title>Dashboard</title>
    {:else} 
        <title>{$user.username.toUpperCase()} Dashboard</title>
    {/if}
</svelte:head>

<main class="content" class:full-width={$sidebarOpen} class:dark-mode={$darkMode}>
    <CatalogoProductos />
</main>

<style lang="scss">
    .content {
        flex-grow: 1;
        padding: 20px;
        transition: all 0.3s ease-in-out;
    }

    .content.full-width {
        width: 100%;
    }
</style>