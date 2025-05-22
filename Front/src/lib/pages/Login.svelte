<script>
    import '../styles/login.scss';
    import { Link, navigate } from "svelte-routing";
    import Swal from 'sweetalert2';
    import { isAuthenticated, loginUser } from "../../stores/auth.store";
    import { onMount } from "svelte";
    import { pathUsuariosMS } from "../../stores/host";
    import { handlePage, setCurrentPage } from '../../stores/page.store';
    // import { obtenerDataLogin } from '../utils/ObtenerData';
    import Carga from './global/Carga.svelte';

    let credencial = $state('');
    let contrasenia = $state('');

    onMount(() => {
        isAuthenticated.subscribe(auth => {
            console.log("User authenticated:", auth);
            handlePage();
        });
    });

    async function getData(rol) {
        const pathToGet = rol === 'admin' ? 
            `${pathUsuariosMS}/admin/admin-dash` : rol === 'user' ?
            `${pathUsuariosMS}/user/user-dash` : '';
        
        try {
            console.log(pathToGet)
            const response = await fetch(pathToGet, {
                method: "GET",
                headers: {
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh'),
                    'Content-Type': 'application/json'
                }
            });
            console.log(response)
            const result = await response.json();
            console.log(result)
            if(!response.ok) { return { success: false, mesage: result.message || 'Error desconocido' } }

            if(result.success) {
                loginUser(result.data);
                setCurrentPage('/home')
                navigate('/home')
                // return { success: true }
                window.location.reload();
            }
        } catch (error) { 
            Swal.fire({
                icon: 'error',
                title: 'Error',
                timer: 2000,
                showConfirmButton: false,
                text: error.message,
            });
        }
        // if(!loginData.success) {
        // } else {
        //     setCurrentPage('/home');
        //     navigate('/home');
        //     window.location.reload();
        // }
    }

    async function loginCredentials() {
        if(!credencial || !contrasenia) {
            alert('Ingrese usuario y contraseña');
            return;
        }
        try {
            const response = await fetch(`${pathUsuariosMS}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ credentials: credencial, contrasenia: contrasenia }),
            });
            console.log(response)
            const data = await response.json();
            console.log(data)

            if(!response.ok) {
                throw new Error(data.message || 'Error desconocido');
            }

            if(data.success) {
                localStorage.setItem('authorization', data.token)
                localStorage.setItem('refresh', data.refresh)
                getData(data.rol);
                console.log('Login successful')
            }
        } catch(e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                timer: 2000,
                showConfirmButton: false,
                text: 'Error al iniciar seción: ' + e.message,
            });
        } finally {
            credencial = '';
            contrasenia = '';
        }
    }
</script>

<svelte:head>
    <title>Login</title>
</svelte:head>

<Carga />
<section class="bg-gray-900 min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md bg-gray-800 rounded-lg shadow-md border border-gray-700 p-6 sm:p-8">
        <div class="flex flex-col items-center mb-6">
            <Link to='/' class='flex items-center text-2xl font-semibold text-white'>
                <img class="w-8 h-8 mr-2" src="./logo.svg" alt="Flowbite Logo" />
                Iskandar APP
            </Link>
        </div>
        <h1 class="text-xl font-bold tracking-tight text-white text-center">
            Inicio Sesión
        </h1>
        <form class="mt-6 space-y-4">
            <div>
                <label for="email" class="block mb-2 text-sm font-medium text-gray-300">
                    Usuario/Contraseña
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    bind:value={credencial}
                    class="w-full p-2.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                    placeholder="youraccount@example.org"
                />
            </div>
            <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-300">
                    Password
                </label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    bind:value={contrasenia}
                    placeholder="••••••••"
                    class="w-full p-2.5 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"
                />
            </div>
            <!-- <div class="flex items-center justify-between">
                <div class="flex items-center">
                    <input
                        id="remember"
                        type="checkbox"
                        class="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-blue-500"
                    />
                    <label for="remember" class="ml-2 text-sm text-gray-300">
                        Remember me
                    </label>
                </div>
                <a href="#" class="text-sm text-blue-500 hover:underline">
                    Forgot password?
                </a>
            </div> -->
            <button
                onclick={() => loginCredentials()}
                class="w-full px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-500 font-medium rounded-lg text-sm text-center"
            >
                Sign in
            </button>
            <p class="text-sm text-gray-300 text-center">
                Don’t have an account yet?
                <Link
                    to='/register'
                    onclick={(event) => {
                        event.preventDefault();
                        setCurrentPage("/register");
                        navigate('/register');
                    }}
                    class="font-medium text-blue-500 hover:underline"
                >
                    Sign up
                </Link>
            </p>
        </form>
    </div>
</section>