import { loginUser, logoutUser, user } from "../../stores/auth.store";
import { pathUsuariosMS } from "../../stores/host";

export async function obtainUserData() {
    const dataUsuario = JSON.parse(localStorage.getItem('user'))
    // console.log(dataUsuario)
    const path = dataUsuario.rol === 'admin' ? 
        `${pathUsuariosMS}/admin/admin-dash` :
        `${pathUsuariosMS}/user/user-dash`;

    try {
        const response = await fetch(path, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('authorization'),
                'refresh':  localStorage.getItem('refresh')
            }
        });
        const result = await response.json();
        // console.log(result)
        if(result.success) {
            loginUser(result.data);
            return { success: true }
            // window.location.reload();
        }
    } catch (error) { return { success: false, message: error } }
}

export async function obtenerDataLogin(rol) {
    const pathToGet = rol === 'admin' ? 
            `${pathUsuariosMS}/admin/admin-dash` : rol === 'user' ?
            `${pathUsuariosMS}/user/user-dash` : '';

    try {
        const response = await fetch(pathToGet, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'authorization': localStorage.getItem('authorization'),
                'refresh':  localStorage.getItem('refresh')
            }
        });
        const result = await response.json();
        
        if(!response.ok) { return { success: false, mesage: result.message || 'Error desconocido' } }

        if(result.success) {
            loginUser(result.data);
            return { success: true }
            // window.location.reload();
        }
    } catch (error) { return { success: false, message: error } }
}