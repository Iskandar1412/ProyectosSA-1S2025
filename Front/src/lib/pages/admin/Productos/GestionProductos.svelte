<script>
    import { onMount } from "svelte";
    import { pathFavoritosMS, pathProductosMS } from "../../../../stores/host";
    import { darkMode } from "../../../../stores/store.dark";
    import Swal from 'sweetalert2';
    
    // Datos
    let productos = [];
    let marcas = [];
    let categorias = [];
    let productoEditando = null;
    let editandoId = null;
    let productoImagenes = null;

    let regionesDisponibles = [];
    let productoSeleccionado = null;
    
    // Estados modales
    let mostrarModalProducto = false;
    let mostrarModalImagenes = false;
    let mostrarModalRegiones = false;
    
    // Formularios
    let nuevoProducto = {
        nombre: '',
        descripcion: '',
        precio: 0,
        valor: 0,
        cantidad: 0,
        id_categoria: '',
        id_marca: '',
        disponibilidad: 0
    };
    
    // Carga inicial de datos
    async function obtenerProductos() {
        try {
            const resProductos = await fetch(`${pathProductosMS}/productos/admin`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                }
            });

            if(!resProductos.ok) {
                throw new Error('Error en la petición')
            }
    
            const dataProductos = await resProductos.json();
            if (dataProductos.success) productos = dataProductos.message;
        } catch(e) {
            console.log("Error en la obtención de productos:", e)
            mostrarError("Error al cargar productos")
        }
    }

    async function obtenerDatos() {
        try {
            const [resMarcas, resCategorias, resRegiones] = await Promise.all([
                fetch(`${pathProductosMS}/marcas`, { headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } }),
                fetch(`${pathProductosMS}/categorias`, { headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } }),
                fetch(`${pathProductosMS}/regiones`, { headers: { 'Content-Type': 'application/json', 'authorization': localStorage.getItem('authorization'), 'refresh':  localStorage.getItem('refresh') } })
            ]);
            
            const dataMarcas = await resMarcas.json();
            const dataCategorias = await resCategorias.json();
            const dataRegiones = await resRegiones.json();
            if (dataMarcas.success) marcas = dataMarcas.message;
            if (dataCategorias.success) categorias = dataCategorias.message;
            if (dataRegiones.success) regionesDisponibles = dataRegiones.message;
            
        } catch (error) {
            console.error("Error al obtener datos:", error);
            mostrarError("Error al cargar datos");
        }
    }
    
    // Productos
    function iniciarEdicion(producto) {
        productoEditando = {
            nombre: producto.nombre || '',
            descripcion: producto.descripcion || '',
            precio: Number(producto.precio) || 0,
            valor: Number(producto.valor) || 0,
            cantidad: Number(producto.cantidad) || 0,
            id_categoria: Number(producto.id_categoria) || 0,
            id_marca: Number(producto.id_marca) || 0,
            disponibilidad: producto.disponibilidad,
            id_producto: producto.id_producto
        };
        editandoId = producto.id_producto;
        mostrarModalProducto = true;
    }
    
    function cancelarEdicion() {
        productoEditando = null;
        editandoId = null;
        mostrarModalProducto = false;
    }

    async function notificar(prod) {
        // console.log(producto)
        try {
            const response = await fetch(`${pathFavoritosMS}/cambios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ producto: prod })
            })

            const result = await response.json()
            if(!response.ok) throw new Error(result.message)
        } catch(e) { mostrarError(e.message); }
    }
    
    async function guardarProducto() {
        try {
            const url = editandoId 
                ? `${pathProductosMS}/productos`
                : `${pathProductosMS}/productos`;
                
            const method = editandoId ? "PUT" : "POST";
            const body = editandoId ? productoEditando : nuevoProducto;
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify(body)
            });
            
            const result = await response.json();
            
            if (result.success) {
                await obtenerProductos();
                if(editandoId !== null) await notificar(body)
                nuevoProducto = { nombre: '', descripcion: '', precio: 0, valor: 0, cantidad: 0, id_categoria: '', id_marca: '', disponibilidad: 0 };
                mostrarExito(editandoId ? "Producto actualizado" : "Producto creado");
                // Poner lo de actualización
                cancelarEdicion();
            } else {
                throw new Error(result.message || "Error al guardar");
            }
        } catch (error) {
            console.error("Error al guardar producto:", error);
            mostrarError(error.message);
        }
    }
    
    async function eliminarProducto(id) {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar producto?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Procesando...',
                    html: 'Eliminando producto',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
                
                const response = await fetch(`${pathProductosMS}/productos/${id}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': localStorage.getItem('authorization'),
                        'refresh':  localStorage.getItem('refresh')
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    await obtenerProductos();
                    mostrarExito("Producto eliminado");
                } else {
                    throw new Error(data.message || "Error al eliminar");
                }
            }
        } catch (error) {
            console.error("Error al eliminar producto:", error);
            mostrarError("Error al eliminar producto");
        }
    }
    
    // Regiones
    function abrirRegiones(producto) {
        productoSeleccionado = {...producto};
        mostrarModalRegiones = true;
    }

    function agregarRegion() {
        console.log(productoSeleccionado)
        productoSeleccionado.regiones = [...productoSeleccionado.regiones, {
            id_region: 0,
            nombre_region: ''
        }];
    }

    function cerrarRegiones() {
        mostrarModalRegiones = false;
        productoSeleccionado = null
    }

    function eliminarRegion(index) {
        productoSeleccionado.regiones = productoSeleccionado.regiones.filter((_, i) => i !== index);
    }

    function cambiarRegion(index, idRegion) {
        const regionSeleccionada = regionesDisponibles.find(r => r.id_region == idRegion);
        const nuevasRegiones = [...productoSeleccionado.regiones];
        
        nuevasRegiones[index] = {
            ...nuevasRegiones[index],
            id_region: Number(idRegion),
            nombre_region: regionSeleccionada ? regionSeleccionada.nombre : ''
        };
        
        productoSeleccionado = {
            ...productoSeleccionado,
            regiones: nuevasRegiones
        };
    }

    async function guardarRegiones() {
        try {
            const response = await fetch(`${pathProductosMS}/productos/regiones`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({ id_producto: productoSeleccionado.id_producto, regiones: productoSeleccionado.regiones })
            });

            const data = await response.json();
            
            if (data.success) {
                await obtenerProductos()
                cerrarRegiones();
                mostrarExito("Regiones actualizadas correctamente");
            } else {
                mostrarError(data.message || "Error al actualizar regiones");
            }
        } catch (error) {
            console.error("Error al guardar regiones:", error);
            mostrarError("Error al guardar cambios");
        }
    }

    // Imágenes
    function abrirGaleriaImagenes(producto) {
        productoImagenes = {...producto};
        mostrarModalImagenes = true;
    }
    
    function cerrarGaleriaImagenes() {
        productoImagenes = null;
        mostrarModalImagenes = false;
    }
    
    async function subirImagen(event) {
        try {
            const file = event.target.files[0];
            if (!file) return;
            
            const base64String = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            Swal.fire({
                title: 'Subiendo imagen...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });
            
            const response = await fetch(`${pathProductosMS}/imagenes`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'authorization': localStorage.getItem('authorization'),
                    'refresh':  localStorage.getItem('refresh')
                },
                body: JSON.stringify({
                    id_producto: productoImagenes.id_producto,
                    imagen: base64String
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                await obtenerProductos();
                console.log(productos)
                mostrarExito("Imagen subida correctamente");
                cerrarGaleriaImagenes()
            } else {
                throw new Error(result.message || "Error al subir imagen");
            }
        } catch (error) {
            console.error("Error al subir imagen:", error);
            mostrarError("Error al subir imagen");
        } finally {
            event.target.value = '';
        }
    }
    
    async function eliminarImagen(idImagen) {
        try {
            const result = await Swal.fire({
                title: '¿Eliminar imagen?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });
            
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Procesando...',
                    html: 'Eliminando imagen',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });
                
                const response = await fetch(`${pathProductosMS}/imagenes/${idImagen}`, {
                    method: "DELETE",
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': localStorage.getItem('authorization'),
                        'refresh':  localStorage.getItem('refresh')
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    await obtenerProductos();
                    productoImagenes.imagenes = productoImagenes.imagenes.filter(img => img.id_imagen !== idImagen);
                    mostrarExito("Imagen eliminada");
                } else {
                    throw new Error(data.message || "Error al eliminar imagen");
                }
            }
        } catch (error) {
            console.error("Error al eliminar imagen:", error);
            mostrarError("Error al eliminar imagen");
        }
    }
    
    // Helpers
    function mostrarError(mensaje) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: mensaje,
            timer: 3000
        });
    }
    
    function mostrarExito(mensaje) {
        Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: mensaje,
            timer: 2000,
            showConfirmButton: false
        });
    }
    
    function formatearFecha(fecha) {
        return new Date(fecha).toLocaleDateString();
    }
    
    onMount(async () => { 
        await obtenerProductos()
        await obtenerDatos()
    });
</script>

<svelte:head>
    <title>Gestión Productos</title>
</svelte:head>

<div class="productos-container {$darkMode ? 'dark-mode' : ''}">
    <div class="header-container">
        <h2>Lista de Productos</h2>
        <button 
            onclick={() => { 
                productoEditando = nuevoProducto;
                mostrarModalProducto = true;
            }} 
            class="btn-agregar"
            title="Agregar nuevo producto"
        >
            + Agregar Producto
        </button>
    </div>

    <table>
        <thead>
            <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Valor</th>
                <th>Stock</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th style="text-align: center;">Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each productos as producto}
                <tr>
                    <td>{producto.codigo}</td>
                    <td>{producto.nombre}</td>
                    <td>${producto.precio.toFixed(2)}</td>
                    <td>${producto.valor.toFixed(2)}</td>
                    <td>{producto.cantidad}</td>
                    <td>{producto.nombre_marca}</td>
                    <td>{producto.nombre_categoria}</td>
                    <td>{formatearFecha(producto.fecha_creacion)}</td>
                    <td class="acciones-td">
                        <button onclick={() => iniciarEdicion(producto)} class="btn-editar" title="Editar">
                            ✏️
                        </button>
                        <button onclick={() => abrirGaleriaImagenes(producto)} class="btn-imagenes" title="Imágenes">
                            🖼️
                        </button>
                        <button onclick={() => abrirRegiones(producto)} class="btn-imagenes" title="Regiones">
                            🗺️
                        </button>
                        <button onclick={() => eliminarProducto(producto.id_producto)} class="btn-eliminar" title="Eliminar">
                            🗑️
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<!-- Modal para producto -->
{#if mostrarModalProducto}
<div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
    <div class="modal-content">
        <button class="close-modal" onclick={cancelarEdicion}>×</button>
        <h3>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        
        <div class="form-grid">
            <div class="form-group">
                <label for="nombre">Nombre:</label>
                <input id="nombre" class="form-input" bind:value={productoEditando.nombre} />
            </div>
            
            <div class="form-group">
                <label for="precio">Precio:</label>
                <input id="precio" type="number" step="0.01" class="form-input" bind:value={productoEditando.precio} />
            </div>
            
            <div class="form-group">
                <label for="valor">Valor:</label>
                <input id="valor" type="number" step="0.01" class="form-input" bind:value={productoEditando.valor} />
            </div>
            
            <div class="form-group">
                <label for="cantidad">Cantidad:</label>
                <input id="cantidad" type="number" class="form-input" bind:value={productoEditando.cantidad} />
            </div>
            
            <div class="form-group">
                <label for="categoria">Categoría:</label>
                <select
                    id="categoria"
                    class="form-input"
                    bind:value={productoEditando.id_categoria}
                >
                    <option value="">Seleccione...</option>
                    {#each categorias as cat}
                        <option value={cat.id_categoria}>{cat.nombre}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-group">
                <label for="marca">Marca:</label>
                <select 
                    id="marca" 
                    class="form-input"
                    bind:value={productoEditando.id_marca}
                >
                    <option value="">Seleccione...</option>
                    {#each marcas as marca}
                        <option value={marca.id_marca}>{marca.nombre}</option>
                    {/each}
                </select>
            </div>
            
            <div class="form-group span-2">
                <label for="descripcion">Descripción:</label>
                <textarea id="descripcion" class="form-input" rows="3" bind:value={productoEditando.descripcion} ></textarea>
            </div>
            
            <div class="form-group">
                <label for="disponibilidad">Disponibilidad:</label>
                <select
                    id="disponibilidad"
                    class="form-input"
                    bind:value={productoEditando.disponibilidad}
                >
                    <option value={1}>Disponible</option>
                    <option value={0}>No disponible</option>
                </select>
            </div>
        </div>
        
        <div class="form-buttons">
            <button onclick={guardarProducto} class="btn-guardar">
                {editandoId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onclick={cancelarEdicion} class="btn-cancelar">
                Cancelar
            </button>
        </div>
    </div>
</div>
{/if}

<!-- Modal para imágenes -->
{#if mostrarModalImagenes && productoImagenes}
<div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
    <div class="modal-content wide-modal">
        <button class="close-modal" onclick={cerrarGaleriaImagenes}>×</button>
        <h3>Galería de Imágenes: {productoImagenes.nombre}</h3>
        
        <div class="upload-container">
            <label for="subir-imagen" class="btn-subir">
                + Subir Nueva Imagen
                <input 
                    id="subir-imagen" 
                    type="file" 
                    accept="image/*" 
                    onchange={subirImagen}
                    style="display: none;"
                />
            </label>
        </div>
        
        <div class="galeria-imagenes">
            {#if productoImagenes.imagenes && productoImagenes.imagenes.length > 0}
                {#each productoImagenes.imagenes as imagen}
                    <div class="imagen-container">
                        <img 
                            src={`${imagen.url_imagen}`} 
                            alt="Imagen del producto" 
                            class="imagen-producto"
                        />
                        <button 
                            onclick={() => eliminarImagen(imagen.id_imagen)} 
                            class="btn-eliminar-imagen"
                            title="Eliminar imagen"
                        >
                            🗑️
                        </button>
                    </div>
                {/each}
            {:else}
                <p class="sin-imagenes">No hay imágenes para este producto</p>
            {/if}
        </div>
    </div>
</div>
{/if}
<!-- Modal para regiones -->
{#if mostrarModalRegiones && productoSeleccionado}
<div class="modal-overlay {$darkMode ? 'dark-mode' : ''}">
    <div class="modal-content wide-modal">
        <button class="close-modal" onclick={cerrarRegiones}>×</button>
        <h3>Regiones para: {productoSeleccionado.nombre}</h3>
        
        <div class="regiones-container">
            <button class="btn-agregar" onclick={agregarRegion}>
                + Agregar Región
            </button>
            
            <div class="lista-regiones">
                {#each productoSeleccionado.regiones as region, index}
                    <div class="region-item">
                        <select 
                            value={region.id_region}
                            onchange={(e) => {cambiarRegion(index, e.target.value)}}
                            class="region-select"
                        >
                            <option value="0">Seleccione una región</option>
                            {#each regionesDisponibles as r}
                                <option value={r.id_region}>
                                    {r.nombre}
                                </option>
                            {/each}
                        </select>
                        
                        <button 
                            onclick={() => eliminarRegion(index)}
                            class="btn-eliminar"
                            title="Eliminar región"
                        >
                            🗑️
                        </button>
                    </div>
                {/each}
            </div>
            
            <div class="modal-actions">
                <button class="btn-cancelar" onclick={cerrarRegiones}>
                    Cancelar
                </button>
                <button class="btn-guardar" onclick={guardarRegiones}>
                    Guardar Cambios
                </button>
            </div>
        </div>
    </div>
</div>
{/if}

<style>
    /* Estilos base */
    .productos-container {
        width: 94%;
        margin: auto;
        padding: 20px;
        background: var(--bg-color);
        color: var(--text-color);
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        max-height: 80vh;
        overflow-y: auto;
    }

    .header-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    h2, h3 {
        margin: 0;
        font-size: 20px;
    }

    h3 {
        margin-bottom: 20px;
        text-align: center;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 20px;
    }

    th, td {
        padding: 10px 5px;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }

    th {
        background: var(--header-bg);
        color: var(--header-text);
    }

    tr:hover {
        background: var(--hover-bg);
    }
    
    /* Botones */
    .btn-agregar {
        background: #007bff;
        color: white;
        padding: 5px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
    }

    .btn-agregar:hover {
        background: #0069d9;
    }
    
    .acciones-td {
        display: flex;
        padding: 10px;
        justify-content: center;
    }
    
    button {
        padding: 5px;
        margin-left: 5px;
        margin-right: 5px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .btn-editar {
        background: #ffc107;
        color: #000;
    }
    
    .btn-editar:hover {
        background: #e0a800;
    }
    
    .btn-eliminar {
        background: #dc3545;
        color: white;
    }
    
    .btn-eliminar:hover {
        background: #c82333;
    }
    
    .btn-imagenes {
        background: #17a2b8;
        color: white;
    }
    
    .btn-imagenes:hover {
        background: #138496;
    }
    
    .btn-guardar {
        background: #28a745;
        color: white;
        padding: 10px 20px;
    }
    
    .btn-guardar:hover {
        background: #218838;
    }
    
    .btn-cancelar {
        background: #6c757d;
        color: white;
        padding: 10px 20px;
    }
    
    .btn-cancelar:hover {
        background: #5a6268;
    }
    
    /* Modales */
    .modal-overlay {
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
    
    .wide-modal {
        max-width: 800px;
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
    
    .span-2 {
        grid-column: span 2;
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
    
    textarea.form-input {
        min-height: 80px;
        resize: vertical;
    }
    
    .form-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }
    
    /* Galería de imágenes */
    .upload-container {
        margin-bottom: 20px;
        text-align: center;
    }
    
    .btn-subir {
        background: #17a2b8;
        color: white;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        display: inline-block;
        transition: background 0.2s;
    }
    
    .btn-subir:hover {
        background: #138496;
    }
    
    .galeria-imagenes {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 15px;
        margin-top: 20px;
    }
    
    .imagen-container {
        position: relative;
        border: 1px solid #ddd;
        border-radius: 4px;
        overflow: hidden;
        height: 150px;
    }
    
    .imagen-producto {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .btn-eliminar-imagen {
        position: absolute;
        top: 5px;
        right: 5px;
        background: rgba(220, 53, 69, 0.8);
        color: white;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        padding: 0;
        font-size: 12px;
    }
    
    .btn-eliminar-imagen:hover {
        background: #c82333;
    }
    
    .sin-imagenes {
        text-align: center;
        grid-column: 1 / -1;
        color: #6c757d;
        padding: 20px;
    }

    /* Variables para regiones */
    .regiones-container {
        padding: 20px;
    }
    
    .btn-agregar {
        background: #28a745;
        color: white;
        padding: 8px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-bottom: 15px;
    }
    
    .btn-agregar:hover {
        background: #218838;
    }
    
    .lista-regiones {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .region-item {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .region-select {
        flex: 1;
        padding: 8px;
        border: 1px solid #ced4da;
        border-radius: 4px;
    }
    
    .btn-eliminar {
        background: #dc3545;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        cursor: pointer;
    }
    
    .btn-eliminar:hover {
        background: #c82333;
    }
    
    .modal-actions {
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
    .dark-mode textarea,
    .dark-mode select {
        border-color: #4b5563;
        background: #1f2937;
        color: white;
    }
    
    .dark-mode .imagen-container {
        border-color: #4b5563;
    }
</style>