<script>
    import { onMount } from "svelte";
    import Swal from 'sweetalert2';
    import { pathUsuariosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import { user } from "../../../../stores/auth.store";

    let usuarios = [];
    
    async function obtenerUsuarios() {
        try {
            const response = await fetch(`${pathUsuariosMS}/admin/get-users`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            const result = await response.json();
            if (result.success) {
                usuarios = result.data;
            }
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        }
    }

    async function guardarCambios(id, activo) {
        try {
            const response = await fetch(`${pathUsuariosMS}/admin/actualizar-estado`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({  id: id, usuario_activo: activo  }),
            });

            const result = await response.json();
            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario Actualizado',
                    text: `Estado del usuario ${id} actualizado correctamente`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al hacer cambios.',
                });
            }
        } catch (error) {
            console.error("Error al guardar cambios:", error);
        }
    }


    onMount(() => { obtenerUsuarios() });
</script>

<svelte:head>
    <title>Gestion Cuentas Activas</title>
</svelte:head>

<div class="usuarios-container {$darkMode ? 'dark-mode' : ''}">
    <h2>Lista de Usuarios</h2>

    <table>
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
                <th>Username</th>
                <th>Teléfono</th>
                <th>Género</th>
                <th>Rol</th>
                <th>Creación</th>
                <th>Activa</th>
            </tr>
        </thead>
        <tbody>
            {#each usuarios as usuario}
                <tr>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.apellido}</td>
                    <td>{usuario.correo}</td>
                    <td>{usuario.username}</td>
                    <td>{usuario.telefono}</td>
                    <td>{usuario.genero}</td>
                    <td>{usuario.rol}</td>
                    <td>{new Date(usuario.fecha_creacion).toLocaleDateString()}</td>
                    <td>
                        <label class="switch">
                            <input
                                type="checkbox"
                                disabled={$user.id_usuario === usuario.id_usuario}
                                checked={usuario.activa}
                                onclick={() => {
                                        usuario.activa = !(usuario.activa)
                                        guardarCambios(usuario.id_usuario, usuario.activa)
                                    }
                                }
                            />
                            <span class="slider"></span>
                        </label>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .usuarios-container {
        width: 94%;
        margin: auto;
        padding: 20px;
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        max-height: 500px;
        overflow-y: auto;
    }

    h2 {
        text-align: center;
        margin-bottom: 20px;
        font-size: 20px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    th, td {
        padding: 10px;
        border-bottom: 1px solid #ddd;
        text-align: left;
        border-radius: 2px;
    }

    th {
        background: var(--header-bg);
        color: var(--header-text);
    }

    tr:hover {
        background: var(--hover-bg);
    }

    .switch {
        position: relative;
        display: inline-block;
        width: 34px;
        height: 20px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 20px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #4CAF50;
    }

    input:checked:disabled + .slider {
        background-color: #333;
    }

    input:checked + .slider:before {
        transform: translateX(14px);
    }

    .usuarios-container::-webkit-scrollbar {
        width: 5px;
    }

    .usuarios-container::-webkit-scrollbar-thumb {
        background-color: #333;
        border-radius: 10px;
    }

    :root {
        --bg-color: #ffffff;
        --text-color: #000000;
        --header-bg: #516664;
        --header-text: white;
        --hover-bg: #f1f1f1;
    }

    .dark-mode {
        --bg-color: #1f2937;
        --text-color: white;
        --header-bg: #374151;
        --header-text: #ffffff;
        --hover-bg: #2d3748;
    }
</style>
