<script>
    import { fade } from "svelte/transition";
    import Fa500Px  from 'svelte-icons/fa/FaGithub.svelte';
    import FaOpencart  from 'svelte-icons/fa/FaOpencart.svelte';
    // import Day  from 'svelte-icons/fa/FaFirstOrder.svelte';
    // import Night  from 'svelte-icons/fa/FaFirstOrderAlt.svelte';
    import { carrito } from '../../../stores/carrito';
    import { darkMode } from "../../../stores/store.dark";
    import { isAuthenticated, logoutUser, user } from "../../../stores/auth.store";
    import { writable } from "svelte/store";
    import { sidebarOpen } from "../../../stores/store.sidevar";
    import { setCurrentPage } from "../../../stores/page.store";
    import { navigate } from "svelte-routing";
    import { pathComprasMS, pathDevolucionesMS, pathFavoritosMS, pathPagosMS, pathProductosMS, pathUsuariosMS } from "../../../stores/host";
    import Swal from "sweetalert2";
    

    let mostrarCarrito = false;
    let mostrarModalPago = false;
    let tarjeta = {
        tipo_tarjeta_1: 0,
        numero_tarjeta_1: '',
        tipo_tarjeta_2: 0,
        numero_tarjeta_2: ''
    }
    
    let pagoHibrido = false;
    let porcentajePrimeraTarjeta = 50;

    async function toggleCarrito() {
        if(!mostrarCarrito) await ObtenerDescuentos()
        mostrarCarrito = !mostrarCarrito;
    }
    
    // Actualizar cantidad de un producto
    function actualizarCantidad(idProducto, cambio) {
        $carrito.forEach(producto => {
            if (producto.id_producto === idProducto) {
                const nuevaCantidad = producto.cantidad + cambio;

                if (nuevaCantidad < 1) {
                    carrito.eliminarProducto(idProducto);
                    return;
                }
                
                if (nuevaCantidad > producto.cantidadMaxima) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: `No puedes agregar más de ${producto.cantidadMaxima} unidades`,
                        timer: 3000
                    });
                    mostrarError(`No puedes agregar más de ${producto.cantidadMaxima} unidades`);
                    return;
                }
                
                carrito.actualizarCantidad(idProducto, nuevaCantidad);
            }
        });
    }

    let descuentosUsuario = null
    let descuentoSeleccionado = null
    let cuponDevolucion = null
    let cuponDevolucionSeleccionado = null

    async function ObtenerDescuentos () {
        try {
            const [resProductos, resCuponDevolucion] = await Promise.all([
                fetch(`${pathUsuariosMS}/user/descuentos`, { method: 'GET', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } }),
                fetch(`${pathDevolucionesMS}/devoluciones/cupon`, { method: 'GET', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } })
            ])
            const dataDescuentos = await resProductos.json();
            const dataCuponDevolucion = await resCuponDevolucion.json();

            if(!resProductos.ok) { mostrarError(dataDescuentos.message); return; }
            if(!resCuponDevolucion.ok) { mostrarError(dataCuponDevolucion.message); return; }

            if(dataDescuentos.success) { descuentosUsuario = dataDescuentos.message } else { descuentosUsuario = null }
            if(dataCuponDevolucion.success) { cuponDevolucion = dataCuponDevolucion.message } else { cuponDevolucion = null }
        } catch(e) {
            descuentosUsuario = null
            console.log("Error en la obtención de productos:", e)
        }
    }

    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            showConfirmButton: false
        });
    }

    function mostrarExito(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Exito',
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        })
    }

    let total = 0
    let subtotal = 0
    
    // Calcular subtotal
    function calcularSubtotal() {
        subtotal = $carrito.reduce((total, item) => total + (item.precio - (item.precio * (item.descuento > 0 ? item.descuento / 100 : 0))) * item.cantidad, 0)
        return $carrito.reduce((total, item) => total + (item.precio - (item.precio * (item.descuento > 0 ? item.descuento / 100 : 0))) * item.cantidad, 0);
    }

    function calcularTotal() {
        const descuento = (descuentosUsuario.find(descuento => descuento.id_descuento_usuario === descuentoSeleccionado))
        const cupon = (cuponDevolucion.find(cupon => cupon.id === cuponDevolucionSeleccionado))
        if (cupon) {
            if(cupon.valor_precio > calcularSubtotal()) {
                total = 0
                return 0
            } else {
                total = calcularSubtotal() - cupon.valor_precio
                return calcularSubtotal() - cupon.valor_precio
            }
        }
        if(descuentoSeleccionado) {
            total = (calcularSubtotal() - (calcularSubtotal() * Number(descuento.porcentaje_descuento) / 100))
            return calcularSubtotal() - (calcularSubtotal() * Number(descuento.porcentaje_descuento) / 100)
        }
        total = calcularSubtotal()
        return calcularSubtotal()
    }

    const toggleSidebar = () => {
        sidebarOpen.update((open) => !open);
    }

    async function pagar() {
        toggleCarrito()
        mostrarModalPago = true;
    }

    
    let userMenuOpen = writable(false);

    function toggleUserMenu() {
        userMenuOpen.update(value => !value);
    }

    function cancelarPago() {
        pagoHibrido = false,
        porcentajePrimeraTarjeta = 50
        mostrarModalPago = false;
        descuentoSeleccionado = null
        descuentosUsuario = null
        tarjeta = { tipo_tarjeta_1: 0, numero_tarjeta_1: '', tipo_tarjeta_2: 0, numero_tarjeta_2: '' }
    }

    async function procederPago() {
        const porcentaje = descuentosUsuario.find(descuento => descuento.id_descuento_usuario === descuentoSeleccionado)
        // console.log(descuentosUsuario)
        const cupon = cuponDevolucion.find(cupon => cupon.id === cuponDevolucionSeleccionado)
        let totalEnviar = total
        if(cupon) {
            totalEnviar = subtotal
        }

        const formPago = {
            id_usuario: $user.id_usuario,
            carrito: $carrito,
            id_descuento_usuario: descuentoSeleccionado !== null ? descuentoSeleccionado : null,
            porcentaje_descuento: descuentoSeleccionado !== null ? porcentaje.porcentaje_descuento: null,
            tipo_pago_1: tarjeta.tipo_tarjeta_1 === 1 ? 'Credito' : 'Debito',
            no_tarjeta_1: tarjeta.numero_tarjeta_1,
            porcentaje_tarjeta_1: !pagoHibrido ? 100 : porcentajePrimeraTarjeta,
            tipo_pago_2: pagoHibrido === false ? null : tarjeta.tipo_tarjeta_2 === 1 ? 'Credito' : 'Debito',
            no_tarjeta_2: pagoHibrido === false ? null : tarjeta.numero_tarjeta_2,
            porcentaje_tarjeta_2: pagoHibrido === false ? null: 100 - porcentajePrimeraTarjeta,
            sub_total: subtotal,
            total_pagar: totalEnviar === 0 ? subtotal : totalEnviar  
        }
        
        if(!formPago.tipo_pago_1 || !formPago.no_tarjeta_1) {
            mostrarError('Campos de metodo de pago y/o número de tarjeta no validos')
            return
        }

        if(pagoHibrido) {
            if(!formPago.tipo_pago_2 || !formPago.no_tarjeta_2 || formPago.tipo_pago_2 === formPago.tipo_pago_1 || formPago.no_tarjeta_1 === formPago.no_tarjeta_2) {
                mostrarError('Campos vacios para segunda tarjeta o es igual los datos a la primera')
                return
            }
        }

        try {
            if(descuentoSeleccionado !== null) {
                // console.log(descuentoSeleccionado)
                const [resDescuentos, resQuitarCupon, resCompras, resActualizarProductos] = await Promise.all([
                    fetch(`${pathUsuariosMS}/admin/descuentos/usuario/generado`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ id_usuario: formPago.id_usuario, monto: formPago.total_pagar }) }),
                    fetch(`${pathUsuariosMS}/user/cupon`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ cupon: formPago.id_descuento_usuario }) }),
                    fetch(`${pathComprasMS}/compras`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ id_usuario: formPago.id_usuario, correo_usuario: $user.correo, total_pagar: formPago.total_pagar, descuento: formPago.porcentaje_descuento, sub_total: formPago.sub_total, carrito: formPago.carrito }) }),
                    fetch(`${pathProductosMS}/productos/actualizar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ carrito: formPago.carrito }) })
                ])
    
                const dataDescuentos = await resDescuentos.json();
                const dataQuitarCupon = await resQuitarCupon.json()
                const dataCompras = await resCompras.json();
                const dataActualizarProductos = await resActualizarProductos.json();
    
                if(!resDescuentos.ok) { mostrarError(dataDescuentos.message); return; } 
                if(!resQuitarCupon.ok) { mostrarError(dataQuitarCupon.message); return; }
                if(!resCompras.ok) { mostrarError(dataCompras.message); return; } 
                if(!resActualizarProductos.ok) { mostrarError(dataActualizarProductos.message); return; } 

                // Aqui se pondra lo de pagos y quiza lo de favoritos
                const [resNotificar, resPagos] = await Promise.all([
                    fetch(`${pathFavoritosMS}/notificar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ carro: formPago.carrito }) }),
                    fetch(`${pathPagosMS}/pagos`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ 
                            id_compra: dataCompras.message,
                            usuario: $user.username,
                            tipo_pago_1: formPago.tipo_pago_1,
                            no_tarjeta_1: formPago.no_tarjeta_1,
                            porcentaje_1: formPago.porcentaje_tarjeta_1,
                            tipo_pago_2: formPago.tipo_pago_2 === null ? 'N/A' : formPago.tipo_pago_2,
                            no_tarjeta_2: formPago.no_tarjeta_2 === null ? null : formPago.no_tarjeta_2,
                            porcentaje_2: formPago.porcentaje_tarjeta_2 === null ? 0.00 : formPago.porcentaje_tarjeta_2,
                            subtotal: formPago.sub_total,
                            cupon_descuento: formPago.porcentaje_descuento === null ? 0 : formPago.porcentaje_descuento,
                            total: formPago.total_pagar
                        })
                    })
                ])

                const dataNotificar = await resNotificar.json()
                const dataPagos = await resPagos.json()

                if(!resNotificar.ok) { mostrarError(dataNotificar.message); return; }
                if(!resPagos.ok) { mostrarError(dataPagos.message); return; }

                cancelarPago()
    
                mostrarExito('Exito al realizar la compra')
                setTimeout(() => {
                    carrito.limpiarCarrito()
                    window.location.reload()
                }, 1500);
            } else {
                const [resDescuentos, resCompras, resActualizarProductos] = await Promise.all([
                    fetch(`${pathUsuariosMS}/admin/descuentos/usuario/generado`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ id_usuario: formPago.id_usuario, monto: formPago.total_pagar }) }),
                    fetch(`${pathComprasMS}/compras`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ id_usuario: formPago.id_usuario, correo_usuario: $user.correo, total_pagar: formPago.total_pagar, descuento: formPago.porcentaje_descuento, sub_total: formPago.sub_total, carrito: formPago.carrito }) }),
                    fetch(`${pathProductosMS}/productos/actualizar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ carrito: formPago.carrito }) })
                ])
    
                const dataDescuentos = await resDescuentos.json();
                const dataCompras = await resCompras.json();
                const dataActualizarProductos = await resActualizarProductos.json();

                if(!resDescuentos.ok) { mostrarError(dataDescuentos.message); return; }
                if(!resCompras.ok) { mostrarError(dataCompras.message); return; }
                if(!resActualizarProductos.ok) { mostrarError(dataActualizarProductos.message); return; }

                // Aqui se pondra lo de pagos y quiza lo de favoritos
                const [resNotificar, resPagos] = await Promise.all([
                    fetch(`${pathFavoritosMS}/notificar`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ carro: formPago.carrito }) }),
                    fetch(`${pathPagosMS}/pagos`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ 
                            id_compra: dataCompras.message,
                            usuario: $user.username,
                            tipo_pago_1: formPago.tipo_pago_1,
                            no_tarjeta_1: formPago.no_tarjeta_1,
                            porcentaje_1: formPago.porcentaje_tarjeta_1,
                            tipo_pago_2: formPago.tipo_pago_2 === null ? 'N/A' : formPago.tipo_pago_2,
                            no_tarjeta_2: formPago.no_tarjeta_2 === null ? null : formPago.no_tarjeta_2,
                            porcentaje_2: formPago.porcentaje_tarjeta_2 === null ? 0.00 : formPago.porcentaje_tarjeta_2,
                            subtotal: subtotal,
                            cupon_descuento: formPago.porcentaje_descuento === null ? 0 : formPago.porcentaje_descuento,
                            total: formPago.total_pagar
                        })
                    })
                ])

                const dataNotificar = await resNotificar.json()
                const dataPagos = await resPagos.json()

                if(!resNotificar.ok) { mostrarError(dataNotificar.message); return; }
                if(!resPagos.ok) { mostrarError(dataPagos.message); return; }
                
                if(cuponDevolucionSeleccionado) {
                    const [resCuponDevolucion] = await Promise.all([
                        fetch(`${pathDevolucionesMS}/devoluciones/cupon`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') }, body: JSON.stringify({ id: cupon.id, id_devolucion: cupon.id_devolucion, valor: cupon.valor_precio, correo: $user.correo, sub_total: formPago.sub_total }) }),
                    ])
    
                    const dataCuponDevolucion = await resCuponDevolucion.json()
    
                    if(!resCuponDevolucion.ok) { mostrarError(dataCuponDevolucion.message); return; }
                }
                

                cancelarPago()
    
                mostrarExito('Exito al realizar la compra')
                setTimeout(() => {
                    carrito.limpiarCarrito()
                    window.location.reload()
                }, 1500);
            }
        } catch(e) {
            mostrarError(e.message)
        }
    }

    function login() {
        setCurrentPage('/login');
        navigate('/login');
    }

    function logout() {
        fetch(`${pathUsuariosMS}/auth/logout`, {
            method: 'POST',
            headers: {
                'authorization': localStorage.getItem('authorization'),
                'refresh':  localStorage.getItem('refresh'),
                'Content-Type': 'application/json'
            }
        })
        .then(res => {
            if(!res.ok) throw new Error('Error logout');
            return res.json();
        })
        .then(data => {
            console.log(data);
            if(data.success) {
                localStorage.removeItem('authorization')
                localStorage.removeItem('refresh')
                logoutUser();
                carrito.limpiarCarrito();
                setCurrentPage('/');
                navigate('/');
            } else {
                throw new Error('Error desconocido');
            }
        })
        .catch((e) => {
            alert(e);
            logoutUser();
            setCurrentPage('/')
            navigate('/')
        })
    }
</script>

<header class="top-bar" class:dark-mode={$darkMode}>
    {#if $isAuthenticated}
        <button class="menu-toggle" onclick={toggleSidebar}>☰</button>
    {:else}
        <p class="menu-toggle"></p>
    {/if}
    <!-- <input type="text" placeholder="Search..." class="search-bar" /> -->

    <div class="user-menu-container">
        {#if $user && $isAuthenticated}
            <span class="user-name">{$user.username}</span>
        {/if}
        <button class="user-icon" onclick={toggleUserMenu}>
            <Fa500Px />
        </button>
        <!-- <button class="mode-toggle" onclick={toggleDarkMode}>
            {#if $darkMode}
                <Night size="15" />
            {:else}
                <Day size="15" />
            {/if}
        </button> -->
        {#if $isAuthenticated && $user.rol === 'user'}
        <div class="cart-icon-container">
            <button 
                class="cart-button"
                onclick={() => toggleCarrito()}
            >
                <FaOpencart />
                {#if $carrito.length > 0}
                    <span class="cart-badge">
                        {new Set($carrito.map(item => item.id_producto)).size}
                    </span>
                {/if}
            </button>
        </div>
        {/if}

        {#if $userMenuOpen}
            {#if $isAuthenticated}
                <div class="user-dropdown" in:fade out:fade>
                    <button onclick={logout}>Cerrar sesión</button>
                </div>
            {:else}
                <div class="user-dropdown" in:fade out:fade>
                    <button onclick={login}>Iniciar Sesión</button>
                </div>
            {/if}
        {/if}
    </div>
</header>
{#if mostrarCarrito}
<div class="carrito-overlay" class:dark-mode={$darkMode} in:fade out:fade>
    <div class="carrito-container" class:dark-mode={$darkMode}>
        <div class="carrito-header">
            <h2>Tu Carrito ({$carrito.length})</h2>
            <button onclick={toggleCarrito} class="close-btn">×</button>
        </div>
        
        <div class="carrito-body" class:dark-mode={$darkMode}>
            {#if $carrito.length > 0}
                <div class="productos-lista" class:dark-mode={$darkMode}>
                    {#each $carrito as producto (producto.id_producto)}
                        <div class="producto-item">
                            <div class="producto-imagen">
                                <img src={producto.imagen} alt={producto.nombre} />
                            </div>
                            
                            <div class="producto-info">
                                <div class="producto-nombre">{producto.nombre}</div>
                                <div class="producto-codigo">Código: {producto.codigo}</div>
                                {#if producto.descuento > 0}
                                    <div
                                        class="producto-precio"
                                        style="text-decoration: line-through; color: #ff0000;"
                                    >
                                        ${producto.precio.toFixed(2)} c/u
                                    </div>
                                    <div class="producto-precio" style="font-size: 15px; color:green">
                                        ${(producto.precio - (producto.precio * producto.descuento / 100)).toFixed(2)} c/u
                                    </div>
                                {:else}
                                    <div class="producto-precio">${producto.precio.toFixed(2)} c/u</div>
                                {/if}
                                <div class="producto-cantidad">
                                    <button 
                                        onclick={() => actualizarCantidad(producto.id_producto, -1)}
                                        disabled={producto.cantidad <= 1}
                                    >
                                        −
                                    </button>
                                    
                                    <span>{producto.cantidad}</span>
                                    
                                    <button 
                                        onclick={() => actualizarCantidad(producto.id_producto, 1)}
                                        disabled={producto.cantidadMaxima && producto.cantidad >= producto.cantidadMaxima}
                                    >
                                        +
                                    </button>
                                </div>
                                
                                <div class="producto-subtotal">
                                    Subtotal: ${((producto.precio - (producto.precio * (producto.descuento > 0 ? producto.descuento / 100 : 0))) * producto.cantidad).toFixed(2)}
                                </div>
                                
                                <button 
                                    onclick={() => carrito.eliminarProducto(producto.id_producto)}
                                    class="eliminar-btn"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
                
                <div class="carrito-resumen">
                    <div class="resumen-linea">
                        <span>Subtotal ({$carrito.length} {$carrito.length === 1 ? 'producto' : 'productos'}):</span>
                        <span>${calcularSubtotal().toFixed(2)}</span>
                    </div>
                    <div class="resumen-linea">
                        <span>Envío:</span>
                        <span>Gratis</span>
                    </div>

                    <div class="resumen-linea">
                        <span>Cupon descuento:</span>
                        <select 
                            name=""
                            class="select-descuentos"
                            bind:value={descuentoSeleccionado}
                            onchange={() => cuponDevolucionSeleccionado = null}
                        >
                            <option value={null}>Seleccionar Descuento</option>
                                {#each descuentosUsuario as carro, index}
                                    <option value={carro.id_descuento_usuario}>{carro.porcentaje_descuento}%</option>
                                {/each}
                        </select>
                    </div>

                    <div class="resumen-linea">
                        <span>Cupon devolucion:</span>
                        <select 
                            name=""
                            class="select-descuentos"
                            bind:value={cuponDevolucionSeleccionado}
                            onchange={() => descuentoSeleccionado = null}
                        >
                            <option value={null}>Seleccionar Cupon</option>
                                {#each cuponDevolucion as cupon, index}
                                    <option value={cupon.id}>Q. {cupon.valor_precio}</option>
                                {/each}
                        </select>
                    </div>
                    
                    <div class="resumen-total">
                        <span>Total:</span>
                        <span>${calcularTotal().toFixed(2)}</span>
                    </div>
                    
                    <button class="pagar-btn" onclick={pagar}>Proceder al pago</button>
                </div>
            {:else}
                <div class="carrito-vacio">
                <p>Tu carrito de compras está vacío</p>
                <button onclick={toggleCarrito}>Seguir comprando</button>
                </div>
            {/if}
        </div>
    </div>
</div>
{/if}

{#if mostrarModalPago}
    <div class="modal-pago {$darkMode ? 'dark-mode' : ''}">
        <div class="modal-content">
            <button class="close-modal" onclick={cancelarPago}>×</button>
            <h3>Pago de Producto</h3>
        
            <!-- Total y Descuento -->
            <div class="form-grid">
                <div class="form-group">
                    <label for="">Total ($):</label>
                    <input disabled class="form-input" bind:value={total} />
                </div>
                <div class="form-group">
                    <label for="">Descuento Aplicado:</label>
                    <input
                        disabled
                        class="form-input"
                        value={descuentoSeleccionado ? 'Descuento Aplicado' : 'Sin descuento'}
                    />
                </div>
            </div>
        
            <!-- Método de pago 1 -->
            <div class="form-grid">
                <div class="form-group">
                    <label for="">Método Pago:</label>
                    <select class="form-input" bind:value={tarjeta.tipo_tarjeta_1}>
                        <option value={0}>Seleccione...</option>
                        <option value={1}>Tarjeta Crédito</option>
                        <option value={2}>Tarjeta Débito</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="">Ingrese tarjeta:</label>
                    <input
                        type="number"
                        class="form-input"
                        disabled={tarjeta.tipo_tarjeta_1 === 0}
                        bind:value={tarjeta.numero_tarjeta_1}
                        required
                    />
                </div>
            </div>
        
            <!-- Pago híbrido -->
            <div class="form-group">
                <label>
                <input type="checkbox" bind:checked={pagoHibrido} />
                    ¿Usar segundo método de pago?
                </label>
            </div>
        
            {#if pagoHibrido}
                <div class="form-group">
                    <label for="">% para la primera tarjeta:</label>
                    <input
                        type="number"
                        min="1"
                        max="99"
                        bind:value={porcentajePrimeraTarjeta}
                        class="form-input"
                    />
                </div>
        
                <div class="form-grid">
                    <div class="form-group">
                        <label for="">Segundo método de pago:</label>
                        <select class="form-input" bind:value={tarjeta.tipo_tarjeta_2}>
                            <option value={0}>Seleccione...</option>
                            <option value={1}>Tarjeta Crédito</option>
                            <option value={2}>Tarjeta Débito</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="">Ingrese tarjeta:</label>
                        <input
                            type="number"
                            class="form-input"
                            disabled={tarjeta.tipo_tarjeta_2 === 0}
                            bind:value={tarjeta.numero_tarjeta_2}
                            required
                        />
                    </div>
                </div>
            {/if}
        
            <!-- Botones -->
            <div class="form-buttons">
                <button onclick={procederPago} class="btn-guardar">Pagar</button>
                <button onclick={cancelarPago} class="btn-cancelar">Cancelar</button>
            </div>
        </div>
    </div>
{/if}

<style>
    .top-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 7vh;
        padding: 10px 20px;
        background-color: #e5e7eb;
        color: cornflowerblue;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: background-color 0.3s;
        :global(svg) {
            width: 30px;
            color: cornflowerblue;
        }
    }

    .dark-mode {
        background-color: #1f2937;
    }

    .menu-toggle {
        font-size: 20px;
        cursor: pointer;
        background: none;
        border: none;
        color: inherit;
    }

    .user-menu-container {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .user-name {
        font-weight: 500;
    }

    .user-icon {
        font-size: 18px;
        cursor: pointer;
        background: none;
        border: none;
        color: inherit;
    }

    .user-dropdown {
        position: absolute;
        right: 20px;
        top: 50px;
        background: white;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 5px;
        overflow: hidden;
        z-index: 10;
        display: flex;
        flex-direction: column;
    }

    .dark-mode .user-dropdown {
        background: #1f2937;
        color: white;
    }

    .user-dropdown button {
        padding: 10px;
        border: none;
        background: transparent;
        cursor: pointer;
        text-align: left;
        width: 100%;
        color: inherit;
    }

    .user-dropdown button:hover {
        background: #f3f4f6;
    }

    .dark-mode .user-dropdown button:hover {
        background: #374151;
    }

    .cart-icon-container {
        position: relative;
        display: inline-block;
    }
    
    .cart-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        position: relative;
        color: inherit; /* Usa el color del texto padre */
        font-size: 1.5rem; /* Tamaño del ícono */
    }
    
    .cart-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ff3d00; /* Color rojo llamativo */
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
        font-weight: bold;
    }

    /* Carito */
    .carrito-overlay {
        position: fixed;
        top: 0;
        right: 0;
        width: 380px;
        height: 100vh;
        box-shadow: -2px 0 10px rgba(0,0,0,0.1);
        z-index: 1000;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .carrito-overlay::-webkit-scrollbar {
        width: 2px; 
    }

    .carrito-overlay::-webkit-scrollbar-track {
        background: #f1f1f1;
    }

    .carrito-overlay::-webkit-scrollbar-thumb {
        background-color: #888;
        border-radius: 50px;
    }

    .carrito-overlay::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
    
    .carrito-header {
        padding: 15px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        text-align: center;
        align-items: center;
        align-content: center;
        cursor: pointer;
        color: #dd4343;
        transition: 1s;
    }

    .close-btn:hover {
        background: none;
        border: none;
        color: #ddd;
        transition: 1s;
    }
    
    .carrito-body {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
    }
    
    .producto-item {
        display: flex;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .producto-imagen {
        width: 100px;
        height: 100px;
        margin-right: 15px;
    }
    
    .producto-imagen img {
        width: 100%;
        height: 100%;
        object-fit: contain;
    }
    
    .producto-info {
        flex: 1;
    }
    
    .producto-nombre {
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .producto-codigo {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 5px;
    }
    
    .producto-cantidad {
        margin: 10px 0;
        display: flex;
        align-items: center;
    }
    
    .producto-cantidad button {
        width: 30px;
        height: 30px;
        border: 1px solid #ddd;
        background-color: #374151;
        border-radius: 10px;
        cursor: pointer;
        transition: 0.5s;
    }

    .producto-cantidad button:hover {
        background-color: #0066c0;
        color: #374151;
        border: 1px solid #374151;
        transition: 0.5s;
    }

    .producto-cantidad button:disabled {
        width: 30px;
        height: 30px;
        border: 1px solid #dd4343;
        background-color: #374151;
        color: #dd4343;
        border-radius: 10px;
        cursor: pointer;
    }
    
    .producto-cantidad span {
        margin: 0 10px;
        min-width: 20px;
        text-align: center;
    }
    
    .producto-subtotal {
        font-weight: bold;
        margin: 5px 0;
    }
    
    .eliminar-btn {
        background: none;
        border: none;
        color: #0066c0;
        cursor: pointer;
        padding: 0;
    }
    
    .carrito-resumen {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #eee;
    }
    
    .resumen-linea {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .select-descuentos {
        width: 60%;
        background-color: #1f2937;
        text-align: center;
        border: #555 1px solid;
        border-radius: 5px;
    }
    
    .resumen-total {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 1.2em;
        margin: 15px 0;
    }
    
    .pagar-btn {
        width: 100%;
        padding: 10px;
        background: #FFD814;
        border: 1px solid #FCD200;
        border-radius: 8px;
        color: #888;
        cursor: pointer;
        font-weight: bold;
        transition: 1.5s;
    }

    .pagar-btn:hover {
        background: #43e651;
        border: 1px solid #27d835;
        color: #374151;
        transition: 1.5s;
    }
    
    .carrito-vacio {
        text-align: center;
        padding: 40px 0;
    }

    /* modal-pagar */
    h3 {
        margin-bottom: 20px;
        text-align: center;
    }

    .modal-pago {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
    }

    .modal-content {
        background: var(--bg-color);
        padding: 25px;
        border-radius: 10px;
        width: 90%;
        max-width: 600px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        position: relative;
        max-height: 90vh;
        overflow-y: auto;
    }

    .close-modal {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-color);
        padding: 5px;
    }

    /* Formularios */
    .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .form-group {
        margin-bottom: 10px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .form-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: var(--bg-color);
        color: var(--text-color);
    }
    
    .form-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    .btn-cancelar {
        background: #6c757d;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .btn-guardar {
        background: #007bff;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }
    
    .btn-guardar:hover {
        background: #0069d9;
    }

    /* Variables para modo oscuro/claro */
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

    .dark-mode .form-input,
    .dark-mode select {
        border-color: #4b5563;
        background: #1f2937;
        color: white;
    }
</style>