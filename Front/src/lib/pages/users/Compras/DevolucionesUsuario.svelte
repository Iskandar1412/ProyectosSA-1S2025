<script>
    import { darkMode } from "../../../../stores/store.dark";
    import EstadoDevolucion from "./Devoluciones/EstadoDevolucion.svelte";
    import ProductosDevolucion from "./Devoluciones/ProductosDevolucion.svelte";
    let activeTab = "solicitud-devolucion";
    const tabs = [
        { id: "solicitud-devolucion", label: "Productos" },
        { id: "estado-devolucion", label: "Ver Devoluciones" },
    ];
</script>

<svelte:head>
    <title>Devoluciones</title>
</svelte:head>

<div class="productos-container {$darkMode ? 'dark-mode' : ''}">
    <!-- Tabs Navigation -->
    <div class="tabs">
        {#each tabs as tab}
            <button
                class:active={activeTab === tab.id}
                class="tab"
                onclick={() => (activeTab = tab.id)}
            >
                {tab.label}
            </button>
        {/each}
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
        {#if activeTab === "solicitud-devolucion"}
            <ProductosDevolucion />
        {/if}
        
        {#if activeTab === "estado-devolucion"}
            <EstadoDevolucion />
        {/if}
    </div>
</div>

<style>
    .productos-container {
        width: 80%;
        margin: 2vh auto;
        padding: 20px;
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        max-height: 88vh;
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
    
    .tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 10px;
    }
  
    .tab {
        padding: 8px 16px;
        border: 1px solid transparent;
        background: none;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        transition: all 0.3s ease;
    }
  
    .tab:hover {
        background: #f0f0f0;
    }
  
    .tab.active {
        background: #007bff;
        color: #fff;
        border-color: #007bff;
    }
  
    .tab-content {
        padding: 20px;
        border-radius: 4px;
    }
</style>
