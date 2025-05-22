<script>
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import Swal from 'sweetalert2';
    import { loginUser, logoutUser, user } from "../../../stores/auth.store";
    import { pathUsuariosMS } from "../../../stores/host";
    import { Paises } from "../../../stores/paises";
    import { darkMode } from "../../../stores/store.dark";
    const nombresPaises = Object.keys(Paises);

    let datos = $state(null);
    let isModalOpen = $state(false);
    let tempEmail = $state("");
    let tempTelefono = $state("");
    let tempDirecciones = $state([]);

    async function obtenerDatos() {
        const path = $user.rol === 'admin' ? 
            `${pathUsuariosMS}/admin/admin-profile` :
            `${pathUsuariosMS}/user/user-profile`;

        try {
            const response = await fetch(path, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }

            const result = await response.json();
            if (result.success) {
                loginUser(result.data)
                datos = result.data;
                tempEmail = result.data.correo;
                tempTelefono = result.data.telefono;
                tempDirecciones = result.data.direcciones;
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al obtner datos: ' + error,
            });
        }
    }

    onMount(async () => {
        await obtenerDatos()
    });

    $effect.pre(() => {
        obtenerDatos()
    })

    function validarTelefono(telefono) {
        if (telefono.length > 8) {
            return telefono.slice(0, 8);
        }
        return telefono;
    }

    function openModal() {
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        tempEmail = $user.correo;
        tempTelefono = $user.telefono;
        tempDirecciones = $user.direcciones;
    }

    function addDireccion() {
        tempDirecciones = [...tempDirecciones, { ciudad: '', departamento: '' }];
    }

    function removeDireccion(index) {
        tempDirecciones = tempDirecciones.filter((_, i) => i !== index);
    }

    function getDepartamentos(ciudad) {
        return ciudad ? Paises[ciudad] : [];
    }

    async function saveChanges() {
        const path = $user.rol === 'admin' ?
            `${pathUsuariosMS}/admin/modify-data-admin` :
            `${pathUsuariosMS}/user/modify-data-user`;
        
        try {
            const response = await fetch(path, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({
                    correo: tempEmail,
                    telefono: tempTelefono,
                    direcciones: tempDirecciones
                }),
            });

            const result = await response.json();
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Modificación exitosa',
                    text: `Datos modificados exitosamente`,
                    timer: 3000,
                    showConfirmButton: false,
                    position: 'top-end'
                });
                setTimeout(async () => {
                    await obtenerDatos();
                }, 3000);
                closeModal();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al actualizar el usuario: ' + result.message,
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el usuario: ' + error,
            });
        }
    }
</script>

<svelte:head>
    <title>Configuración</title>
</svelte:head>

{#if $user && datos}
    <div class="user-wrapper">
        <h2 class="user-title">Datos del Usuario</h2>

        <div class="user-container">
            <img
                class="user-image"
                src="{
                    datos.foto === null ?
                    'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png' :
                    datos.foto === '' ?
                    'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_640.png' :
                    datos.foto}"
                alt="Perfil"
            />

            <div class="user-info">
                <div class="data-item"><strong>Nombre:</strong><br>{datos.nombre}</div>
                <div class="data-item"><strong>Apellido:</strong><br>{datos.apellido}</div>
                <div class="data-item"><strong>Correo:</strong><br>{datos.correo}</div>
                <div class="data-item"><strong>Username:</strong><br>{datos.username}</div>
                <div class="data-item"><strong>Teléfono:</strong><br>{datos.telefono}</div>
                <div class="data-item"><strong>Género:</strong><br>{datos.genero === 'M' ? "Masculino" : "Femenino"}</div>
                <div class="data-item"><strong>Fecha de Nacimiento:</strong><br>{datos.fecha_nacimiento}</div>
                <div class="data-item"><strong>Fecha de Creación:</strong><br>{datos.fecha_creacion}</div>
                <div class="data-item"><strong>Rol:</strong><br>{datos.rol}</div>
                <div class="data-item"><strong>Ciudad:</strong><br>{datos.direcciones[0].ciudad}</div>
                <div class="data-item"><strong>Departamento:</strong><br>{datos.direcciones[0].departamento}</div>
            </div>
        </div>

        <button class="edit-button" onclick={openModal}>Modificar Datos</button>
    </div>
{/if}

{#if isModalOpen}
    <div class="modal-overlay" transition:fade>
        <div class="modal">
            <h3>Modificar Datos</h3>
            <div style="display: flex; flex-direction: row; justify-content: space-between;">
                <div style="flex: 1; margin-right: 20px;">
                    <label for="email">Correo:</label>
                    <input type="email" bind:value={tempEmail} />
                </div>
                <div style="flex: 1;">
                    <label for="telefono">Teléfono:</label>
                    <input type="text" bind:value={tempTelefono} oninput={(e) => tempTelefono = validarTelefono(e.target.value)} />
                </div>
            </div>

            <label for="direcciones" style="margin-top: 20px;">Direcciones:</label>
            <div style="max-height: 400px; overflow-y: auto; margin-top: 10px;" class="direcciones-container">
                {#each tempDirecciones as direccion, index}
                    <div class="direccion-item">
                        <div class="input-group {$darkMode ? 'dark-mode' : ''}">
                            <label for="">Ciudad (País):</label>
                            <select bind:value={direccion.ciudad} class="{$darkMode ? 'dark-mode' : ''}">
                                <option value="">Seleccione Ciudad</option>
                                {#each nombresPaises as pais}
                                    <option value={pais}>{pais}</option>
                                {/each}
                            </select>
                        </div>
                
                        <div class="input-group">
                            <label for="">Departamento:</label>
                            <select 
                                bind:value={direccion.departamento}
                                disabled={!direccion.ciudad}
                                class="{$darkMode ? 'dark-mode' : ''}"
                            >
                                <option value="">
                                    {direccion.ciudad ? 'Seleccione Departamento' : 'Primero seleccione Ciudad'}
                                </option>
                                {#each getDepartamentos(direccion.ciudad) as departamento}
                                    <option value={departamento}>{departamento}</option>
                                {/each}
                            </select>
                        </div>
                
                        <button class="remove-btn" onclick={() => removeDireccion(index)}>❌</button>
                    </div>
                {/each}
            </div>

            <button class="add-btn" onclick={addDireccion}>➕ Agregar Dirección</button>

            <div class="modal-buttons">
                <button class="save-btn" onclick={saveChanges}>Guardar Cambios</button>
                <button class="cancel-btn" onclick={closeModal}>Cancelar</button>
            </div>
        </div>
    </div>
{/if}
<!-- {#if isModalOpen}
    <div class="modal-overlay" transition:fade>
        <div class="modal">
            <h3>Modificar Datos</h3>
            
            <label for="email">Correo:</label>
            <input type="email" bind:value={tempEmail} />

            <label for="telefono">Teléfono:</label>
            <input type="text" bind:value={tempTelefono} oninput="{(e) => tempTelefono = validarTelefono(e.target.value)}" />

            <label for="direcciones">Direcciones:</label>
            <div class="direcciones-container">
                {#each tempDirecciones as direccion, index}
                    <div class="direccion-item">
                        <div class="input-group">
                            <label for="">Ciudad:</label>
                            <input type="text" bind:value={tempDirecciones[index].ciudad} />
                        </div>
            
                        <div class="input-group">
                            <label for="">Departamento:</label>
                            <input type="text" bind:value={tempDirecciones[index].departamento} />
                        </div>
            
                        <button class="remove-btn" onclick={() => removeDireccion(index)}>❌</button>
                    </div>
                {/each}
            </div>

            <button class="add-btn" onclick={addDireccion}>➕ Agregar Dirección</button>

            <div class="modal-buttons">
                <button class="save-btn" onclick={saveChanges}>Guardar Cambios</button>
                <button class="cancel-btn" onclick={closeModal}>Cancelar</button>
            </div>
        </div>
    </div>
{/if} -->


<style>
    .user-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
        padding: 20px;
    }

    .user-title {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 10px;
    }

    .user-container {
        display: flex;
        align-items: center;
        margin: auto;
        gap: 30px;
        padding: 20px;
        width: 100%;
        background: inherit;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .user-image {
        width: 180px;
        height: 180px;
        object-fit: cover;
        border-radius: 50%;
        border: 3px solid #007bff;
    }

    .user-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        width: 100%;
    }

    .data-item {
        padding: 12px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        transition: 0.3s ease-in-out;
        border-left: 5px solid #007bff;
        background: inherit;
    }

    .data-item:hover {
        transform: scale(1.05);
    }

    .edit-button {
        padding: 12px 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: bold;
        transition: 0.3s ease-in-out;
    }

    .edit-button:hover {
        background: #0056b3;
        transform: scale(1.05);
    }

    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .modal {
        background: var(--modal-bg);
        color: var(--modal-text);
        padding: 25px;
        border-radius: 12px;
        width: 50vw;
        max-height: 80vh;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: all 0.3s ease-in-out;
        overflow-y: auto;
    }

    .direcciones-container {
        max-height: 200px;
        overflow-y: auto;
        padding-right: 10px;
        scrollbar-width: thin;
        scrollbar-color: var(--scroll-thumb) var(--scroll-track);
    }

    .direcciones-container::-webkit-scrollbar {
        width: 6px;
    }

    .direcciones-container::-webkit-scrollbar-track {
        background: var(--scroll-track);
        border-radius: 10px;
    }

    .direcciones-container::-webkit-scrollbar-thumb {
        background: var(--scroll-thumb);
        border-radius: 10px;
    }

    .dark-mode {
        background-color: #111111;
        color: white;
    }

    :root {
        --modal-bg: #111111;
        --modal-text: #ffffff;
        --input-bg: #111111;
        --input-text: #f3f4f6;
        --button-bg: #007bff;
        --button-hover: #0056b3;
    }

    .modal input {
        width: 100%;
        padding: 10px;
        margin: 5px 0;
        border-radius: 5px;
        border: 1px solid #ccc;
        background: #111111;
        color: #f3f4f6;
        transition: 0.3s ease-in-out;
    }

    .modal input:focus {
        outline: none;
        border-color: var(--button-bg);
    }

    .direcciones-container {
        max-height: 200px;
        overflow-y: auto;
        background: #111111;
        padding-right: 10px;
    }

    .direccion-item {
        display: flex;
        align-items: flex-start;
        gap: 15px;
        padding: 8px;
        border-radius: 5px;
        background: #111111;
        margin-bottom: 5px;
        flex-wrap: wrap;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
    }

    .input-group label {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 3px;
    }

    .input-group select {
        background: #424242;
        padding: 2px;
        border-radius: 5px;
    }

    .direccion-item input {
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #ccc;
        background: #111111;
        color: #f3f4f6;
        transition: 0.3s ease-in-out;
        width: 100%;
    }

    .remove-btn {
        background: rgb(175, 28, 28);
        color: white;
        border: none;
        padding: 8px;
        border-radius: 5px;
        cursor: pointer;
        transition: 0.2s ease-in-out;
    }

    .remove-btn:hover {
        background: darkred;
    }

    .add-btn {
        background: green;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        transition: 0.2s ease-in-out;
    }

    .add-btn:hover {
        background: darkgreen;
    }

    .modal-buttons {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .save-btn,
    .cancel-btn {
        padding: 10px;
        width: 48%;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease-in-out;
    }

    .save-btn {
        background: var(--button-bg);
        color: white;
    }

    .save-btn:hover {
        background: var(--button-hover);
    }

    .cancel-btn {
        background: gray;
        color: white;
    }

    .cancel-btn:hover {
        background: darkgray;
    }
</style>
