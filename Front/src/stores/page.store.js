import { writable } from "svelte/store";
import { navigate } from "svelte-routing";

const storedPage = localStorage.getItem('ultimaPagina');
export const currentPage = writable(storedPage);

export function setCurrentPage(newPage) {
    localStorage.setItem('ultimaPagina', newPage);
    currentPage.set(newPage);
    // console.log(newPage)
}

export function handlePage() {
    const lastPage = localStorage.getItem("ultimaPagina");
    const isUserAuthenticated = JSON.parse(localStorage.getItem("user")) !== null;
    // console.log(lastPage)
    if (isUserAuthenticated && lastPage === "/") {
        setCurrentPage("/home");
        navigate("/home");
    } else {
        setCurrentPage(lastPage);
        navigate(lastPage);
    }
}
