import { writable } from 'svelte/store';

function createCarritoStore() {
    const initialValue = JSON.parse(sessionStorage.getItem('carrito')) || [];
    const { subscribe, set, update } = writable(initialValue);

    return {
        subscribe,
        agregarProducto: (producto, cantidad) => {
            update(items => {
                const itemExistente = items.find(item => item.id_producto === producto.id_producto);
                const precio = producto.valor < producto.precio ? producto.valor : producto.precio;
                
                if (itemExistente) {
                    itemExistente.cantidad = cantidad;
                } else {
                    items.push({
                        ...producto,
                        cantidad,
                        precioSeleccionado: precio
                    });
                }
                
                sessionStorage.setItem('carrito', JSON.stringify(items));
                return items;
            });
        },
        eliminarProducto: (idProducto) => {
            update(items => {
                const nuevosItems = items.filter(item => item.id_producto !== idProducto);
                sessionStorage.setItem('carrito', JSON.stringify(nuevosItems));
                return nuevosItems;
            });
        },
        actualizarCantidad: (idProducto, nuevaCantidad) => {
            update(items => {
                const item = items.find(item => item.id_producto === idProducto);
                if (item) {
                    item.cantidad = Math.max(1, nuevaCantidad);
                    sessionStorage.setItem('carrito', JSON.stringify(items));
                }
                return items;
            });
        },
        limpiarCarrito: () => {
            set([]);
            sessionStorage.removeItem('carrito');
        }
    };
}

export const carrito = createCarritoStore();
