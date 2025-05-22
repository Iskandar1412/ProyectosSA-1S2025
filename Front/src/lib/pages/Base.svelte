<script>
    import { onMount } from "svelte";
    let { Component } = $props();

    import { isAuthenticated, loginUser, logoutUser, user } from "../../stores/auth.store";
    import Sidebar from "./attributes/Sidebar.svelte";
    import Topbar from "./attributes/Topbar.svelte";
    import { navigate } from "svelte-routing";
    import { handlePage, setCurrentPage } from "../../stores/page.store";
    import { darkMode } from "../../stores/store.dark";
    import Carga from "./global/Carga.svelte";
    import ActivarCuenta from "./ActivarCuenta.svelte";
    import { pathUsuariosMS } from "../../stores/host";
    import Chatbot from "./global/Chatbot.svelte";

    function logout() {
        fetch(`${pathUsuariosMS}/auth/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('authorization'),
                'refresh':  localStorage.getItem('refresh')
            }
        })
        .then(res => {
            if(!res.ok) throw new Error('Error logout');
            return res.json();
        })
        .then(data => {
            // console.log(data);
            if(data.success) {
                logoutUser();
                setCurrentPage('/');
                navigate('/');
            } else {
                throw new Error('Error desconocido');
            }
        })
        .catch((e) => {
            alert(e);
        })
    }

    onMount(() => {
        handlePage();
    });

</script>

<Carga />
{#if $isAuthenticated && !($user.correo_confirmado)}
    <ActivarCuenta />
{/if}
{#if $isAuthenticated && !($user.activa)}
    {alert('Su cuenta está desactivada')}
    <!-- {console.log("Ejecutando salida")} -->
    {logout()}
{/if}
{#if !($isAuthenticated) && !($user)}
    
    <div class="dashboard" class:dark-mode={$darkMode}>
        <Topbar />
        <div class='dashboard-container'>
            <Component />
        </div>
    </div>
{/if}
{#if $isAuthenticated && $user.activa && $user.correo_confirmado}
    <div class="dashboard" class:dark-mode={$darkMode}>
        <Topbar />
        
        <div class="dashboard-container">
            <Sidebar />
            
            <Component />
        </div>
    </div>
    {#if $user.rol === 'user'}
        <Chatbot />
    {/if}
{/if}
  
<style lang="scss">
    .dashboard {
        display: flex;
        flex-direction: column;
        height: auto;
        min-height: 100vh;
        transition: background-color 0.3s ease;
    }

    .dark-mode {
        background-color: #111827;
        color: white;
    }
    
    .dashboard-container {
        display: flex;
        flex-grow: 1;
        min-height: 93vh;
        transition: all 0.3s ease-in-out;
    }
</style>