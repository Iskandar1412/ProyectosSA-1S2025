<script>
    import { onMount, tick } from "svelte";
    import { Link, navigate } from "svelte-routing";
    import { fly } from "svelte/transition";
    import Swal from 'sweetalert2';
    import { isAuthenticated } from "../../stores/auth.store";
    import { handlePage, setCurrentPage } from "../../stores/page.store";
    import { pathUsuariosMS } from "../../stores/host";
    import Carga from "./global/Carga.svelte";
    import { Paises } from "../../stores/paises";
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
        p_departamento: ''
    };
    
    $: ciudadesDisponibles = formData.p_ciudad ? Paises[formData.p_ciudad] : [];
    $: {
        ciudadesDisponibles = formData.p_ciudad ? Paises[formData.p_ciudad] : [];
        if (formData.p_ciudad && formData.p_departamento && 
            !ciudadesDisponibles.includes(formData.p_departamento)) {
        formData.p_departamento = '';
        }
    }

    onMount(() => {
        isAuthenticated.subscribe(auth => {
            console.log("User authenticated:", auth);
            handlePage();
        });
    })

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
            const response = await fetch(`${pathUsuariosMS}/auth/register`, {
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
                    timer: 5000,
                    showConfirmButton: false,
                    position: 'top-end'
                });
                setCurrentPage('/login');
                navigate('/login');
            }
        } catch(e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar el usuario: ' + e,
            });
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
    <title>Nuevo Usuario</title>
</svelte:head>

<Carga />
<section class="register-container">
    {#if showToast}
        <div class="toast-message" in:fly={{ y: -50, duration: 300 }} out:fly={{ y: -50, duration: 300 }}>
            {toastMessage}
        </div>
    {/if}

    <div class="register-card">
        <div class="register-logo">
            <Link 
                to='/' 
                onclick={(event) => {
                    event.preventDefault();
                    setCurrentPage("/login");
                    navigate("/login");
                }} 
                class='register-brand flex items-center text-1xl font-semibold w-40'
            >
                <img class="w-8 h-8 mr-2" src="./logo.svg" alt="Flowbite Logo" />
                Iskandar APP
            </Link>
        </div>
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
                    <button type="button" onclick={submitForm}  class="btn-primary">Sign Up</button>
                {/if}
            </div>
        </form>
    </div>
</section>

<style lang="scss">
    .register-container {
        background-color: #111827;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .register-card {
        width: 100%;
        max-width: 400px;
        background-color: #1f2937;
        border-radius: 10px;
        padding: 24px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        border: 1px solid #374151;
        min-height: 280px;
        overflow: hidden;
    }

    .register-title {
        font-size: 20px;
        font-weight: bold;
        color: white;
        text-align: center;
        margin-bottom: 16px;
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
        color: #d1d5db;
        margin-bottom: 4px;
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
</style>
