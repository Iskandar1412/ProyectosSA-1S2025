<script>
    import { tick } from "svelte";
    import { fly } from "svelte/transition";
    import Swal from 'sweetalert2';
    import { pathUsuariosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import { Paises } from "../../../../stores/paises";
    const nombresPaises = Object.keys(Paises);
    
    let step = 1; 
    let formData = {
        p_nombre: '',
        p_apellido: '',
        p_correo: '',
        p_username: '',
        p_telefono: '',
        p_genero: '',
        p_fecha_nacimiento: '',
        p_imagen: null,
        p_contrasenia: '',
        p_ciudad: '',
        p_departamento: '',
        p_rol: 'user' 
    };

    $: ciudadesDisponibles = formData.p_ciudad ? Paises[formData.p_ciudad] : [];
    $: {
        ciudadesDisponibles = formData.p_ciudad ? Paises[formData.p_ciudad] : [];
        if (formData.p_ciudad && formData.p_departamento && 
            !ciudadesDisponibles.includes(formData.p_departamento)) {
        formData.p_departamento = '';
        }
    }

    let showToast = false;
    let toastMessage = "";

    // Mensajes de errores
    function showError(message) {
        toastMessage = message;
        showToast = true;

        setTimeout(() => {
            showToast = false;
        }, 3000);
    }

    // Función opciones formulario
    async function nextStep() {
        if (step === 1 && (!formData.p_nombre || !formData.p_apellido)) {
            showError("Ingrese nombres y apellidos");
            return;
        }
        if (step === 2 && (!formData.p_correo || !formData.p_username)) {
            showError("Ingrese correo y usuario");
            return;
        }
        if (step === 3 && (!formData.p_telefono || !formData.p_genero)) {
            showError("Ingrese telefono y genero");
            return;
        }
        if (step === 4 && (!formData.p_ciudad || !formData.p_departamento)) {
            showError("Ingrese ciudad y departamento");
            return;
        }
        if (step === 5 && (!formData.p_fecha_nacimiento || !formData.p_contrasenia)) {
            showError("Ingrese fecha de nacimiento y contraseña");
            return;
        }

        step++;
        await tick();
    }

    // Regresar
    function prevStep() {
        if (step > 1) step--;
    }

    function validarTelefono(telefono) {
        if (telefono.length > 8) {
            return telefono.slice(0, 8);
        }
        return telefono;
    }

    async function submitForm() {
        if (!formData.p_fecha_nacimiento || !formData.p_contrasenia) {
            showError("Ingrese Fecha y Contraseña");
            return;
        }

        try {
            const path = formData.p_rol === 'admin' ?
                `${pathUsuariosMS}/auth/register-admin` :
                `${pathUsuariosMS}/auth/register`
            
            const response = await fetch(path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error desconocido');
            }

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Usuario creado',
                    text: `Usuario registrado exitosamente`,
                    timer: 1500,
                    showConfirmButton: false,
                    position: 'top-end'
                });
                window.location.reload();
            }
        } catch(e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el usuario: ' + e,
            });
        } finally {
            step = 1;
        }
    }

    function handleImagenUpload(event) {
        const file = event.target.files[0];
        if(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64String = e.target.result;
                formData.p_imagen = base64String;
            }
            reader.readAsDataURL(file);
        }
    }
</script>

<svelte:head>
    <title>Creación Cuentas</title>
</svelte:head>

<section class="register-container {$darkMode ? 'dark-mode' : 'light-mode'}">
    {#if showToast}
        <div class="toast-message" in:fly={{ y: -50, duration: 300 }} out:fly={{ y: -50, duration: 300 }}>
            {toastMessage}
        </div>
    {/if}

    <div class="register-card">
        <h1 class="register-title">
            {step === 1 ? "Paso 1: Información Personal" :
            step === 2 ? "Paso 2: Correo y Usuario" :
            step === 3 ? "Paso 3: Teléfono y Género" :
            step === 4 ? "Paso 4: Ciudad y Departamento" :
            "Paso 5: Datos/Contraseña e Imagen"}
        </h1>

        <form class="register-form">
            <div class="form-content">
                {#if step === 1}
                    <div in:fly={{ x: -100, duration: 400 }} out:fly={{ x: 100, duration: 0 }}>
                        <div class="input-group">
                            <label for="">Nombres</label>
                            <input type="text" bind:value={formData.p_nombre} class="input-field" placeholder="Ingrese su nombre" />
                        </div>
                        <div class="input-group">
                            <label for="">Apellidos</label>
                            <input type="text" bind:value={formData.p_apellido} class="input-field" placeholder="Ingrese su apellido" />
                        </div>
                    </div>
                {/if}

                {#if step === 2}
                    <div in:fly={{ x: -100, duration: 400 }} out:fly={{ x: 100, duration: 0 }}>
                        <div class="input-group">
                            <label for="">Correo</label>
                            <input type="text" bind:value={formData.p_correo} class="input-field" placeholder="Ingrese su correo" />
                        </div>
                        <div class="input-group">
                            <label for="">Usuario</label>
                            <input type="text" bind:value={formData.p_username} class="input-field" placeholder="Ingrese su usuario" />
                        </div>
                    </div>
                {/if}

                {#if step === 3}
                    <div in:fly={{ x: -100, duration: 400 }} out:fly={{ x: 100, duration: 0 }}>
                        <div class="input-group">
                            <label for="">Teléfono</label>
                            <input type="text" bind:value={formData.p_telefono} class="input-field" placeholder="Ingrese su telefono" oninput="{(e) => formData.p_telefono = validarTelefono(e.target.value)}" />
                        </div>
                        <div class="input-group">
                            <label for="">Género</label>
                            <select bind:value={formData.p_genero} class="input-field">
                                <option value="">Seleccione su género</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>
                {/if}

                {#if step === 4}
                    <div in:fly={{ x: -100, duration: 400 }} out:fly={{ x: 100, duration: 0 }}>
                        <div class="input-group">
                            <label for="">Ciudad</label>
                            <select bind:value={formData.p_ciudad} class="input-field">
                                <option value="">Seleccione Pais</option>
                                {#each nombresPaises as pais}
                                    <option value={pais}>{pais}</option>
                                {/each}
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="">Departamento</label>
                            <select bind:value={formData.p_departamento} class="input-field" disabled={!formData.p_ciudad}>
                                <option value="">Seleccione Departamento</option>
                                {#each ciudadesDisponibles as departamento}
                                    <option value={departamento}>{departamento}</option>
                                {/each}
                            </select>
                        </div>
                    </div>
                {/if}
                
                {#if step === 5}
                    <div in:fly={{ x: -100, duration: 400 }} out:fly={{ x: 100, duration: 0 }}>
                        <div class="input-group">
                            <label for="">Imagen</label>
                            <input 
                                type="file"
                                accept="image/*"
                                onchange={(e) => handleImagenUpload(e)}
                                class="input-field"
                                placeholder="Select IMG" 
                            />
                        </div>
                        <div class="input-group">
                            <label for="">Fecha Nacimiento</label>
                            <input type="date" bind:value={formData.p_fecha_nacimiento} class="input-field" />
                        </div>
                        <div class="input-group">
                            <label for="">Contraseña</label>
                            <input type="password" bind:value={formData.p_contrasenia} class="input-field"
                                placeholder="Ingrese su contraseña" />
                        </div>
                        <div class="input-group">
                            <label for="">Rol</label>
                            <select bind:value={formData.p_rol} class="input-field">
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Buttons -->
            <div class="button-group">
                {#if step > 1}
                    <button type="button" onclick={prevStep} class="btn-secondary">Back</button>
                {/if}
                {#if step < 5}
                    <button type="button" onclick={nextStep} class="btn-primary">Next</button>
                {/if}
                {#if step === 5}
                    <button type="button" onclick={submitForm}  class="btn-primary">Crear Usuario</button>
                {/if}
            </div>
        </form>
    </div>
</section>

<style lang="scss">
    .register-container {
        background-color: #111827;
        display: flex;
        margin: auto;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 45%;
        border-radius: 10px;
    }

    .register-card {
        width: 100%;
        max-width: 100%;
        background-color: #1f2937;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #374151;
        min-height: 280px;
        overflow: hidden;
    }

    .toast-message {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #dc2626;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 999;
    }

    .form-content {
        min-height: 140px;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 12px;
    }

    .input-group label {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
    }

    .dark-mode .input-group label {
        color: #d1d5db;
    }

    .light-mode .input-group label {
        color: #252525;
    }

    .input-field {
        width: 100%;
        padding: 10px;
        background-color: #374151;
        border: 1px solid #4b5563;
        color: #d1d5db;
        border-radius: 6px;
        font-size: 14px;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
        margin-top: 16px;
    }

    .btn-primary {
        background-color: #2563eb;
        color: white;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
    }

    .btn-secondary {
        background-color: #4b5563;
        color: white;
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
    }

    /* Para el modo claro */
    .light-mode {
        --bg-color: #ffffff;
        --text-color: #000000;
        --header-bg: #007bff;
        --header-text: white;
        --hover-bg: #f1f1f1;
        background-color: #f9f9f9;
        color: #000;
    }

    .light-mode .register-card {
        background-color: #ffffff;
        border: 1px solid #d1d5db;
    }

    .light-mode .input-field {
        background-color: #f9fafb;
        color: #1f2937;
    }

    .light-mode .btn-primary {
        background-color: #3b82f6;
    }

    .light-mode .btn-secondary {
        background-color: #e5e7eb;
        color: #1f2937;
    }

    .light-mode .register-title {
        font-size: 20px;
        font-weight: bold;
        color: black;
        text-align: center;
        margin-bottom: 16px;
    }

    .dark-mode .register-title {
        font-size: 20px;
        font-weight: bold;
        color: white;
        text-align: center;
        margin-bottom: 16px;
    }

    /* Para el modo oscuro */
    .dark-mode {
        --bg-color: #111827;
        --text-color: white;
        --header-bg: #374151;
        --header-text: white;
        --hover-bg: #2d3748;
        background-color: #111827;
        color: white;
    }

    .dark-mode .register-card {
        background-color: #1f2937;
        border: 1px solid #374151;
    }

    .dark-mode .input-field {
        background-color: #374151;
        color: #d1d5db;
    }

    .dark-mode .btn-primary {
        background-color: #2563eb;
    }

    .dark-mode .btn-secondary {
        background-color: #4b5563;
        color: white;
    }
</style>