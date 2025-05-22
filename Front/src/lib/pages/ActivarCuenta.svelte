<script>
    import { fade } from "svelte/transition";
    import { logoutUser, user } from "../../stores/auth.store";
    import { navigate } from "svelte-routing";
    import { setCurrentPage } from "../../stores/page.store";
    import { pathUsuariosMS } from "../../stores/host";
    import { obtainUserData } from "../utils/ObtenerData";

    let verificationCode = "";
    let loading = false;
    let message = "";

    async function ObtenerDataUsuario() {
        const login = await obtainUserData()
        if(!login.success) { alert(login.message) }
        else { window.location.reload() }
    }

    async function enviarCodigoVerificacion() {
        loading = true;
        message = "";
        try {
            const path = $user.rol === 'admin' ? 
                `${pathUsuariosMS}/admin/autenticate` :
                `${pathUsuariosMS}/user/autenticate`;

            const response = await fetch(path, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ code: verificationCode }),
            });
            const result = await response.json();
            
            message = result.success ? "Cuenta activada con éxito" : result.message;
            if (result.success) {
                // console.log(result)
                ObtenerDataUsuario();
            }
        } catch (error) {
            message = "Error al activar la cuenta";
        } finally {
            setInterval(() => {
                message = '';
            }, 5000);
        }
        loading = false;
    }

    async function reenviarCodigoActivacion() {
        loading = true;
        message = "";
        try {
            const path = $user.rol === 'admin' ? 
                `${pathUsuariosMS}/admin/changeCodeAuthentication` :
                `${pathUsuariosMS}/user/changeCodeAuthentication`;

            const response = await fetch(path, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });
            const result = await response.json();
            message = result.success ? "Correo reenviado con éxito" : "Error al reenviar";
        } catch (error) {
            message = "Error al reenviar el correo";
        } finally {
            setInterval(() => {

                message = '';
            }, 5000);
        }
        loading = false;
    }

    function logout() {
        fetch(`${pathUsuariosMS}/auth/logout`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('authorization'),
                'refresh':  localStorage.getItem('refresh')
            }
        })
        .then((res) => {
            if (!res.ok) throw new Error("Error logout");
            return res.json();
        })
        .then((data) => {
            if (data.success) {
                logoutUser();
                setCurrentPage("/");
                navigate("/");
            } else {
                throw new Error("Error desconocido");
            }
        })
        .catch((e) => {
            alert(e);
        });
    }
</script>

<svelte:head>
    <title>Activar Cuenta</title>
</svelte:head>

<div class="wrapper">
    <div class="container" transition:fade>
        <button class="logout-btn" onclick={logout} title="Cerrar Sesión">
            ⏻
        </button>

        <h1><strong>Activar Cuenta</strong></h1>
        <p>Se ha enviado un código de activación a: <strong>{$user.correo}</strong></p>

        <input 
            type="text" 
            placeholder="Código de verificación" 
            bind:value={verificationCode} 
            maxlength="6"
        />

        <div class="button-group">
            <button class="btn-secondary" onclick={reenviarCodigoActivacion} disabled={loading}>
                {loading ? "Reenviando..." : "Reenviar Correo"}
            </button>

            <button class="btn-primary" onclick={enviarCodigoVerificacion} disabled={loading || verificationCode.length !== 6}>
                {loading ? "Verificando..." : "Enviar Código"}
            </button>
        </div>

        {#if message}
            <p class="message">{message}</p>
        {/if}
    </div>
</div>

<style>
    body {
        background-color: #121212;
        color: white;
        font-family: Arial, sans-serif;
    }

    .wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background-color: #1e1e1e;
    }

    .container {
        position: relative;
        max-width: 400px;
        padding: 20px;
        background: #1e1e1e;
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        text-align: center;
    }

    .logout-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 18px;
    }

    .logout-btn:hover {
        color: red;
    }

    input {
        width: 100%;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        border: 1px solid #555;
        background: #2b2b2b;
        color: white;
        text-align: center;
    }

    .button-group {
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    button {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
        margin: 5px;
        transition: background 0.3s;
    }

    .btn-primary {
        background: #007bff;
        color: white;
    }

    .btn-primary:hover {
        background: #0056b3;
    }

    .btn-secondary {
        background: #28a745;
        color: white;
    }

    .btn-secondary:hover {
        background: #218838;
    }

    .btn-danger {
        background: #dc3545;
        color: white;
    }

    .btn-danger:hover {
        background: #c82333;
    }

    button:disabled {
        background: gray;
        cursor: not-allowed;
    }

    .message {
        margin-top: 10px;
        font-size: 14px;
        color: #ffcc00;
    }
</style>