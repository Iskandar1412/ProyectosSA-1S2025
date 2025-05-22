import { writable } from "svelte/store";
import { pathUsuariosMS} from './host';

const storedUser = JSON.parse(localStorage.getItem('user')) || null;
export const user = writable(storedUser);
export const isAuthenticated = writable(storedUser !== null);

// Función para iniciar sesión
export function loginUser(usuario) {
    if (!usuario) return;
    const userInfo = usuario;
    localStorage.setItem('user', JSON.stringify(userInfo));
    isAuthenticated.set(true);
}

// Función para cerrar sesión
export function logoutUser() {
    localStorage.removeItem('user');
    user.set(null);
    isAuthenticated.set(false);
}


export async function validateUser() {
    //hacemos una petición a la API para validar el token 
    //si el token es valido, nos retorna el usuario

        try {
            const response = await fetch(`${pathUsuariosMS}/user/validate-token`, {
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
            if(result.success && result.user) {
                return result.user;
            }
        } catch (error) {
            console.log(error);
            logoutUser();
            return null;
        }
}