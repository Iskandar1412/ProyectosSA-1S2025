<script>
    import { onMount } from 'svelte';
    import Swal from 'sweetalert2';
    import FaRegHeart from 'svelte-icons/fa/FaRegHeart.svelte'
    import { pathFavoritosMS, pathProductosMS } from '../../../../stores/host';
    import { carrito } from '../../../../stores/carrito';
    import { isAuthenticated, user } from '../../../../stores/auth.store';

    let productos = [];
    let productosFiltrados = [];
    let marcas = [];
    let categorias = [];
    let favoritos = [];

    $: idsFavoritos = favoritos.map(f => f.id_producto);
    $: productosMostrados = true 
        ? productosFiltrados.filter(p => idsFavoritos.includes(p.id_producto))
        : productosFiltrados;
    
    let productoSeleccionado = null;
    let mostrarModal = false;

    // Obtener productos y datos relacionados
    async function obtenerProductos() {
        try {
            const response = await fetch(`${pathProductosMS}/productos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            const data = await response.json();
            // console.log(data)
            if (!response.ok) throw new Error(data.message || 'Error desconocido');
            
            productos = data.message;
            productosFiltrados = [...productos];
            
        } catch(e) {
            mostrarError('Error', 'Error al obtener los productos')
            console.error(e);
        }
    }

    async function obtenerMarcas() {
        try {
            const response = await fetch(`${pathProductosMS}/marcas`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error(data.message || 'Error desconocido');
            marcas = data.message;
            
            
        } catch(e) {
            mostrarError('Error', 'Error al obtener las marcas')
            console.error(e);
        }
    }

    async function obtenerCategorias() {
        try {
            const response = await fetch(`${pathProductosMS}/categorias`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            const data = await response.json();
            // console.log(data)
            if (!response.ok) throw new Error(data.message || 'Error desconocido');
            categorias = data.message;
            
            
        } catch(e) {
            mostrarError('Error', 'Error al obtener las categorias')
            console.error(e);
        }
    }

    async function obtenerFavoritos() {
        try {
            const response = await fetch(`${pathFavoritosMS}/favoritos`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });
            const data = await response.json();
            if(!response.ok) throw new Error(data.message || 'Error desconocido')
            favoritos = Array.isArray(data) ? data : 
                Array.isArray(data.message) ? data.message : [];

        } catch(e) {
            mostrarError('Error', 'Error al obtener favoritos')
        }
    }

    function esFavoritoSeleccionado(producto) {
        if (!producto || !producto.id_producto) return false;
        return favoritos.some((item) => item.id_producto === producto.id_producto);
    }

    async function likeUnlikeProduct(id_producto) {
        try {
            const response = await fetch(`${pathFavoritosMS}/favoritos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ id_producto: id_producto, correo: $user.correo })
            })

            const data = await response.json()
            if(!response.ok) throw new Error(data.message || 'Error desconocido')
        } catch(e) {
            mostrarError('Error', e.message)
        }
    }
    
    function abrirModalProducto(producto) {
        productoSeleccionado = producto;
        cantidadSeleccionada = 1;
        mostrarModal = true;
        document.body.style.overflow = 'hidden';
    }
    
    function cerrarModal() {
        mostrarModal = false;
        document.body.style.overflow = 'auto';
    }
    
    let cantidadSeleccionada = 1;

    function incrementarCantidad() {
        if (cantidadSeleccionada < productoSeleccionado.cantidad) {
            cantidadSeleccionada++;
        } else {
            mostrarInfo('Stock máximo', `No hay más unidades disponibles de este producto`)
        }
    }
    
    function decrementarCantidad() {
        if (cantidadSeleccionada > 1) {
            cantidadSeleccionada--;
        }
    }
    
    function actualizarCantidad(e) {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1) {
            cantidadSeleccionada = Math.min(value, productoSeleccionado.cantidad);
        } else {
            cantidadSeleccionada = 1;
        }
    }
    
    function agregarAlCarrito() {
        mostrarError('No hay suficiente stock', `Solo quedan ${productoSeleccionado.cantidad} unidades disponibles`)
        if (productoSeleccionado.cantidad < cantidadSeleccionada) {
            return;
        }

        const regionesUsuario = $user.direcciones
        const regionesProducto = productoSeleccionado.regiones
        const resultado = regionesUsuario.some(usuarioRegion =>
            regionesProducto.some(productoRegion =>
                productoRegion.region_nombre === usuarioRegion.ciudad
            )
        );

        if(!resultado) {
            mostrarError('Producto no disponible', `El producto no está disponible en su region`)
            setTimeout(() => {
                cerrarModal();
            }, 1200);
            return;
        }

        let imagen = productoSeleccionado.imagenes.length > 0 ? productoSeleccionado.imagenes[0].url_imagen : 'https://blog.springworks.in/wp-content/themes/fox/images/placeholder.jpg'
        let descuentoProducto = productoSeleccionado.promociones.length > 0 ? productoSeleccionado.promociones[0].porcentaje_promocion : 0
        carrito.agregarProducto({
                id_producto: productoSeleccionado.id_producto,
                codigo: productoSeleccionado.codigo,
                nombre: productoSeleccionado.nombre,
                precio: productoSeleccionado.precio,
                valor: productoSeleccionado.valor,
                imagen: imagen,
                descuento: descuentoProducto,
                cantidadMaxima: productoSeleccionado.cantidad
            },
            cantidadSeleccionada
        );
        mostrarExito('¡Producto agregado!', `${cantidadSeleccionada} ${cantidadSeleccionada > 1 ? 'unidades' : 'unidad'} de ${productoSeleccionado.nombre}`)
        
        setTimeout(() => {
            cerrarModal()
        }, 1500);
    }

    function mostrarError(title, mensaje) {
        Swal.fire({
            icon: 'error',
            title: title,
            text: mensaje,
            timer: 3000,
            showConfirmButton: false
        });
    }

    function mostrarExito(title, mensaje) {
        Swal.fire({
            icon: 'success',
            title: title,
            text: mensaje,
            timer: 3000,
            showConfirmButton: false
        });
    }

    function mostrarInfo(title, message) {
        Swal.fire({
            icon: 'info',
            title: title,
            text: message,
            timer: 1500,
            showConfirmButton: false
        });
    }

    onMount(() => {
        obtenerProductos();
        obtenerFavoritos();
        obtenerMarcas();
        obtenerCategorias();
    });
</script>

<svelte:head>
    <title>Favoritos</title>
</svelte:head>

<div class="container">
    <div class="productos-grid">
        {#each productosMostrados  as producto}
            <button class="producto-card" onclick={() => abrirModalProducto(producto)}>
                <img 
                    src={producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url_imagen : 'https://blog.springworks.in/wp-content/themes/fox/images/placeholder.jpg'} 
                    alt={producto.nombre}
                />
                <div class="producto-info">
                    <h3>{producto.nombre}</h3>
                    <p class="precio">${producto.precio.toFixed(2)}</p>
                    {#if producto.promociones[0]?.porcentaje_promocion}
                        <p class="rebaja">¡{producto.promociones[0].porcentaje_promocion}% Descuento! ~ ${(producto.precio - (producto.precio * producto.promociones[0].porcentaje_promocion / 100)).toFixed(2)}</p>
                    {/if}
                    <p class:stock-bajo={producto.cantidad <= 5} class="stock">
                        Stock: {producto.cantidad} {producto.cantidad <= 5 ? '(Quedan pocos!)' : ''}
                    </p>
                </div>
            </button>
        {/each}
    </div>
</div>

{#if mostrarModal && productoSeleccionado}
    <div class="modal-overlay">
        <div class="modal-producto">
            <button class="cerrar-modal" onclick={cerrarModal}>×</button>
                {#if $isAuthenticated && $user.rol === 'user'}
                    <button 
                        class={esFavoritoSeleccionado(productoSeleccionado) ? "like-button" : "unlike-button"}
                        onclick={async () => {
                                await likeUnlikeProduct(productoSeleccionado.id_producto)
                                await obtenerFavoritos()
                                await cerrarModal()
                                productoSeleccionado = productoSeleccionado
                            }
                        }
                    >
                        {#if esFavoritoSeleccionado(productoSeleccionado)}
                            <FaRegHeart class="filled"/>
                        {:else}
                            <FaRegHeart class="outline"/>
                        {/if}
                    </button>
                {/if}
            <div class="modal-contenido">
                <div class="modal-imagenes">
                    <img 
                        src={productoSeleccionado.imagenes && productoSeleccionado.imagenes.length > 0 ? productoSeleccionado.imagenes[0].url_imagen : 'https://blog.springworks.in/wp-content/themes/fox/images/placeholder.jpg'} 
                        alt={productoSeleccionado.nombre}
                    />
                    <h3 class="titulo-region">Regiones Disponibles</h3>
                    <div class="modal-regiones">
                        {#each productoSeleccionado.regiones as region, index}
                            <div class="region">{region.region_nombre}</div>
                        {/each}
                    </div>
                </div>
                
                <div class="modal-info">
                    <h2>{productoSeleccionado.nombre}</h2>
                    <p class="codigo">Código: {productoSeleccionado.codigo}</p>
                    <p class="marca">Marca: {productoSeleccionado.nombre_marca}</p>
                    <p class="categoria">Categoría: {productoSeleccionado.nombre_categoria}</p>
                    <p class="cantidad">En Stock: {productoSeleccionado.cantidad}</p>
                    <p class="descripcion">{productoSeleccionado.descripcion}</p>
                    
                    <div class="precios">
                        {#if productoSeleccionado.promociones.length > 0}
                            <p class="precio-anterior">${productoSeleccionado.precio.toFixed(2)}</p>
                            <p class="precio-actual">${(productoSeleccionado.precio - productoSeleccionado.precio * productoSeleccionado.promociones[0].porcentaje_promocion / 100).toFixed(2)}</p>
                            <p class="ahorro">Ahorras ${(productoSeleccionado.precio - (productoSeleccionado.precio - productoSeleccionado.precio * productoSeleccionado.promociones[0].porcentaje_promocion / 100)).toFixed(2)}</p>
                        {:else}
                            <p class="precio-actual">${productoSeleccionado.precio.toFixed(2)}</p>
                        {/if}
                    </div>
                    
                    {#if !$user?.rol || $user.rol !== 'admin'}
                        <div class="selector-cantidad">
                            <label for="cantidad">Cantidad:</label>
                            <div class="controles-cantidad">
                                <button onclick={decrementarCantidad} class="btn-cantidad" type="button">-</button>
                                <input 
                                    type="number" 
                                    id="cantidad" 
                                    bind:value={cantidadSeleccionada}
                                    min="1"
                                    max={productoSeleccionado.cantidad}
                                    onchange={actualizarCantidad}
                                    class="input-sin-flechas"
                                />
                                <button onclick={incrementarCantidad} class="btn-cantidad" type="button">+</button>
                            </div>
                            <span class="maximo">Máximo: {productoSeleccionado.cantidad}</span>
                        </div>
                        <button 
                            onclick={agregarAlCarrito}
                            class="btn-carrito"
                            disabled={$isAuthenticated === true ? false: true}
                            >
                            Agregar al carrito ({cantidadSeleccionada})
                        </button>
                    {/if}
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #121212;
        color: #e0e0e0;
    }
    
    .container {
        max-width: 80%;
        margin: 0 auto;
        padding: 20px;
    }
    
    button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    
    .productos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 25px;
    }

    .stock {
        margin: 0.3rem 0;
        font-size: 0.7rem;
        color: #4CAF50; /* Verde por defecto */
    }
    
    .stock-bajo {
        color: #f44336; /* Rojo cuando hay poco stock */
        font-weight: bold;
    }
    
    .producto-card {
        background: #1e1e1e;
        border-radius: 10px;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .producto-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    }
    
    .producto-card img {
        width: 100%;
        height: 200px;
        border-radius: 10px;
        object-fit: cover;
    }
    
    .producto-info {
        padding: 15px;
    }
    
    .producto-card h3 {
        margin: 0 0 10px 0;
        font-size: 1.1rem;
        color: #ffffff;
    }
    
    .precio {
        font-weight: bold;
        font-size: 1.2rem;
        margin: 5px 0;
        color: #4CAF50;
    }
    
    .rebaja {
        color: #ff9800;
        font-weight: bold;
        font-size: 0.9rem;
    }
    
    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    }
    
    .modal-producto {
        background: #1e1e1e;
        border-radius: 15px;
        width: 80%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    
    .cerrar-modal {
        position: absolute;
        top: 15px;
        right: 15px;
        background: transparent;
        border: none;
        color: #aaa;
        font-size: 2rem;
        cursor: pointer;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    .like-button {
        position: absolute;
        top: 15px;
        left: 10px;
        border: none;
        width: 40px;
        height: 40px;
    }

    .like-button :global(svg) {
        position: absolute;
        left: 1vw;
        top: 5px;
        color: #d32f2f;
        font-size: 15px;
        width: 30px;
        height: 30px;
        transition: 1s;
    }

    .like-button :global(svg):hover {
        color: #f1f1f1;
        transition: 1s;
    }

    .unlike-button {
        position: absolute;
        top: 15px;
        left: 10px;
        border: none;
        width: 40px;
        height: 40px;
    }

    .unlike-button :global(svg) {
        position: absolute;
        left: 1vw;
        top: 5px;
        color: #616161;
        font-size: 15px;
        width: 30px;
        height: 30px;
        transition: 1s;
    }

    .unlike-button :global(svg):hover {
        color: #3e8e41;
        transition: 1s;
    }
    
    .cerrar-modal:hover {
        background: #333;
        color: white;
    }
    
    .modal-contenido {
        display: flex;
        padding: 30px;
        gap: 30px;
    }
    
    .modal-imagenes {
        flex: 1;
    }
    
    .modal-imagenes img {
        width: 100%;
        max-height: 30vh;
        object-fit: contain;
        border-radius: 8px;
    }

    .modal-imagenes .modal-regiones {
        width: 100%;
        height: auto;
        max-height: 15vh;
        overflow-y: auto;
        padding: 1vh;
        margin-top: 3vh;
    }

    .modal-imagenes .titulo-region {
        width: 45%;
        text-align: center;
        position: absolute;
        font-family: 'Courier New', Courier, monospace;
        font-weight: 500;
        color: #aaa;
        font-size: larger;
    }

    .modal-regiones {
        display: flex;
        flex-wrap: wrap;
    }

    .modal-regiones::-webkit-scrollbar {
        width: 2px; 
    }

    .modal-regiones::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .modal-regiones::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 50px;
    }

    .modal-regiones::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    .region {
        width: 37%;
        height: 8vh;
        text-align: center;
        align-content: center;
        background-color: #121212;
        color: #616161;
        font-size: small;
        padding: 2%;
        border-radius: 10px;
        margin-top: 1%;
        margin-bottom: 1%;
        margin-left: 7%;
        box-sizing: border-box;
    }
    
    .modal-info {
        flex: 1;
    }
    
    .modal-info h2 {
        margin-top: 0;
        color: white;
    }
    
    .codigo, .marca, .categoria, .cantidad {
        color: #aaa;
        margin: 5px 0;
        font-size: 0.9rem;
    }
    
    .descripcion {
        margin: 20px 0;
        line-height: 1.6;
    }
    
    .precios {
        margin: 20px 0;
    }
    
    .precio-anterior {
        text-decoration: line-through;
        color: #aaa;
        font-size: 1.1rem;
    }
    
    .precio-actual {
        font-size: 1.8rem;
        font-weight: bold;
        color: #4CAF50;
        margin: 5px 0;
    }
    
    .ahorro {
        color: #ff9800;
        font-weight: bold;
    }
    
    .btn-carrito {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 6px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        width: 100%;
        margin-top: 15px;
    }
    
    .btn-carrito:hover:not(:disabled) {
        background: #3e8e41;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    }
    
    .btn-carrito:disabled {
        background: #616161;
        cursor: not-allowed;
        opacity: 0.7;
    }
    
    .btn-carrito:active:not(:disabled) {
        transform: translateY(0);
    }

    /* ----------------------- */

    .selector-cantidad {
        margin: 20px 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .controles-cantidad {
        display: flex;
        align-items: center;
        gap: 5px;
    }
    
    .btn-cantidad {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #2d2d2d;
        color: white;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-cantidad:hover {
        background: #3d3d3d;
    }
    
    .selector-cantidad input {
        width: 60px;
        text-align: center;
        padding: 10px;
        border: 1px solid #444;
        background: #2d2d2d;
        color: white;
        border-radius: 5px;
    }
    
    .maximo {
        font-size: 0.8rem;
        color: #888;
    }
    
    .input-sin-flechas::-webkit-outer-spin-button,
    .input-sin-flechas::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .input-sin-flechas {
        -moz-appearance: textfield;
        appearance: textfield;
    }

    .input-sin-flechas {
        width: 60px;
        text-align: center;
        padding: 10px;
        border: 1px solid #444;
        background: #2d2d2d;
        color: white;
        border-radius: 5px;
    }
    
    @media (max-width: 768px) {
        .modal-contenido {
            flex-direction: column;
            padding: 20px;
        }
    }
</style>