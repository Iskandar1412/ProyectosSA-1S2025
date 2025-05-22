<script>
    import Swal from "sweetalert2";
    import { pathUsuariosMS } from "../../../../stores/host";
    import { onMount } from "svelte";
    let activeTab = "solicitud-queja";
    
    const tabs = [
        { id: "solicitud-queja", label: "Nueva Queja" },
        { id: "ver-quejas", label: "Ver quejas" },
    ];

    let tiposQueja = [
        { id: 'Producto', nombre: "Producto" },
        { id: 'Servicio', nombre: "Servicio" },
        { id: 'Pagos', nombre: "Pagos" },
        { id: 'Otro', nombre: "Otro" }
    ];
  
    let quejaActual = {
        tipo: "",
        descripcion: ""
    };
  
    let historialQuejas = [];

    async function obtenerQuejas() {
        try {
            const response = await fetch(`${pathUsuariosMS}/user/quejas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            })

            const dataResponse = await response.json()
            if(!response.ok) {
                // mostrarError(dataResponse.message)
                return
            }

            historialQuejas = dataResponse.message;
        } catch(e) { mostrarError(e.message) }
    }
  
    async function enviarQueja() {
        if (!quejaActual.tipo || !quejaActual.descripcion) {
            mostrarError("Por favor complete todos los campos");
            return;
        }

        try {
            const response = await fetch(`${pathUsuariosMS}/user/quejas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ tipo: quejaActual.tipo, descripcion: quejaActual.descripcion })
            })

            const dataResponse = await response.json()
            quejaActual = { tipo: "", descripcion: "" };
            await obtenerQuejas()
            activeTab = 'ver-quejas'
            if(!response.ok) {
                mostrarError(dataResponse.message)
                return
            }

            mostrarExito('Exito al realizar la queja')

        } catch (e) { mostrarError(e.message) }
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
    
    function mostrarExito(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    }

    onMount(async () => { await obtenerQuejas() })
</script>

<svelte:head>
    <title>Quejas</title>
</svelte:head>

<div class="quejas-container">
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
        {#if activeTab === "solicitud-queja"}
            <div class="formulario-queja">
                <h2>Registrar Nueva Queja</h2>
                
                <div class="form-group">
                    <label for="tipo-queja">Tipo de Queja:</label>
                    <select 
                        id="tipo-queja" 
                        bind:value={quejaActual.tipo}
                        class="form-control"
                    >
                        <option value="">Seleccione un tipo</option>
                        {#each tiposQueja as tipo}
                            <option value={tipo.id}>{tipo.nombre}</option>
                        {/each}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="descripcion">Descripción:</label>
                    <textarea 
                        id="descripcion" 
                        bind:value={quejaActual.descripcion}
                        class="form-control"
                        rows="5"
                        placeholder="Describa su queja con detalle..."
                    ></textarea>
                </div>
                
                <button onclick={enviarQueja} class="btn-enviar">
                    Enviar Queja
                </button>
            </div>
        {/if}
        
        {#if activeTab === "ver-quejas"}
            <div class="historial-quejas">
                <h2>Historial de Quejas</h2>
            
                {#if historialQuejas.length === 0}
                    <p class="sin-quejas">No hay quejas registradas</p>
                {:else}
                    <div class="quejas-list">
                        {#each historialQuejas as queja}
                            <div class="queja-item">
                                <div class="queja-header">
                                    <span class="tipo-queja">{queja.tipo_queja}</span>
                                    <span class="fecha-queja">{queja.fecha}</span>
                                    <span class="estado-queja {queja.estado.toLowerCase().replace(' ', '-')}">{queja.estado}</span>
                                </div>
                                <div class="descripcion-queja">{queja.descripcion}</div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
  
  <style>
    .quejas-container {
        width: 50vw;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        color: #e0e0e0;
        border-radius: 8px;
        /* box-shadow: 0 2px 12px rgba(0,0,0,0.3); */
    }
    
    .tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
    }
  
    .tab {
        padding: 8px 16px;
        border: 1px solid #333;
        background: #2d2d2d;
        color: #e0e0e0;
        border-radius: 4px 4px 0 0;
        cursor: pointer;
        transition: all 0.3s ease;
    }
  
    .tab:hover {
        background: #232323;
    }
  
    .tab.active {
        background: #007bff;
        color: #fff;
        border-color: #007bff;
    }
  
    .tab-content {
        padding: 20px;
        border-radius: 4px;
        background: #1a1a1a;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    
    .formulario-queja {
        max-width: 600px;
        margin: 0 auto;
    }
    
    .form-group {
        margin-bottom: 20px;
    }
    
    label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: #e0e0e0;
    }
    
    .form-control {
        width: 100%;
        padding: 10px;
        border: 1px solid #333;
        border-radius: 4px;
        font-size: 16px;
        background-color: #232323;
        color: #e0e0e0;
    }
    
    textarea.form-control {
        min-height: 120px;
        resize: vertical;
    }
    
    .btn-enviar {
        background: #007bff;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background 0.3s;
        width: 100%;
        max-width: 200px;
    }
    
    .btn-enviar:hover {
        background: #0056b3;
    }
    
    .quejas-list {
        height: 57vh;
        max-height: 57vh;
        overflow-y: auto;
        padding-right: 10px;
    }

    .quejas-list::-webkit-scrollbar {
        width: 2px; 
    }

    .quejas-list::-webkit-scrollbar-track {
        background: #232323;
    }

    .quejas-list::-webkit-scrollbar-thumb {
        background-color: #555;
        border-radius: 50px;
    }

    .quejas-list::-webkit-scrollbar-thumb:hover {
        background: #888;
    }
    
    .queja-item {
        border-bottom: 1px solid #333;
        padding: 15px 0;
    }
    
    .queja-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .tipo-queja {
        font-weight: bold;
        color: #fff;
    }
    
    .fecha-queja {
        color: #bbb;
        font-size: 0.9em;
    }
    
    .estado-queja {
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 0.8em;
        font-weight: bold;
        text-transform: capitalize;
    }
    
    .estado-queja.pendiente {
        background: #33301a;
        color: #ffe066;
    }

    .estado-queja.rechazado {
        background: #1d1d1d;
        color: #ff4b4b;
    }
    
    .estado-queja.en-revision {
        background: #232f44;
        color: #7ecbff;
    }
    
    .estado-queja.resuelto {
        background: #1d3321;
        color: #8fff9f;
    }
    
    .descripcion-queja {
        color: #d1d1d1;
        line-height: 1.5;
    }
    
    .sin-quejas {
        text-align: center;
        color: #bbb;
        padding: 20px;
    }

    .historial-quejas {
        max-height: 60vh;
        height: 60vh;
    }
    
    @media (max-width: 768px) {
        .quejas-container {
            padding: 10px;
        }
        
        .tab {
            padding: 8px 12px;
            font-size: 14px;
        }
        
        .queja-header {
            flex-direction: column;
            align-items: flex-start;
        }
    }
</style>