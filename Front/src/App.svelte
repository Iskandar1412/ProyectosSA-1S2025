<script>
  import { Route, Router } from "svelte-routing";
  import { onMount } from "svelte";
  import { isAuthenticated, user } from "./stores/auth.store";
  import Login from "./lib/pages/Login.svelte";
  import Register from "./lib/pages/Register.svelte";
  import { handlePage } from "./stores/page.store";
  import Base from "./lib/pages/Base.svelte";
  import Home from "./lib/pages/global/Home.svelte";
  import ConfiguracionUsuario from "./lib/pages/global/ConfiguracionUsuario.svelte";
  import ActivarDesactivarCuentas from "./lib/pages/admin/Usuarios/ActivarDesactivarCuentas.svelte";
  import CrearCuentas from "./lib/pages/admin/Usuarios/CrearCuentas.svelte";
  import SeguimientoUsuarios from "./lib/pages/admin/Usuarios/SeguimientoUsuarios.svelte";
  import GestionCategorias from "./lib/pages/admin/Productos/GestionCategorias.svelte";
  import GestionMarcas from "./lib/pages/admin/Productos/GestionMarcas.svelte";
  import GestionProductos from "./lib/pages/admin/Productos/GestionProductos.svelte";
  import GestionDescuentos from "./lib/pages/admin/Usuarios/GestionDescuentos.svelte";
  import DescuentosUsuarios from "./lib/pages/admin/Usuarios/DescuentosUsuarios.svelte";
  import GestionPromociones from "./lib/pages/admin/Productos/GestionPromociones.svelte";
  import PromocionesProductos from "./lib/pages/admin/Productos/PromocionesProductos.svelte";
  import FavoritosUsuario from "./lib/pages/users/Productos/FavoritosUsuario.svelte";
  import HistorialComprasUsuario from "./lib/pages/users/Compras/HistorialComprasUsuario.svelte";
  import SeguimientoCompraUsuario from "./lib/pages/users/Compras/SeguimientoCompraUsuario.svelte";
  import QuejasUsuario from "./lib/pages/users/Problemas/QuejasUsuario.svelte";
  import DevolucionesUsuario from "./lib/pages/users/Compras/DevolucionesUsuario.svelte";
  // import SoporteUsuario from "./lib/pages/users/soporte/SoporteUsuario.svelte";
  import EstadoProductosComprados from "./lib/pages/admin/Productos/EstadoProductosComprados.svelte";
  // import PagosAdminUsuarios from "./lib/pages/admin/Usuarios/PagosAdminUsuarios.svelte";
  import PagosUsuarios from "./lib/pages/users/Pagos/PagosUsuarios.svelte";
    import DevolucionesAdmin from "./lib/pages/admin/Usuarios/DevolucionesAdmin.svelte";
  
  onMount(() => {
    isAuthenticated.subscribe(auth => {
      console.log("User authenticated:", auth);
      handlePage();
    });
  });
</script>

<Router>
  <Route path="/">
    <Base Component={Home} />
  </Route>
  <Route path="/login"><Login /></Route>
  <Route path="/register"><Register /></Route>
  
  <!-- Gobal -->
  <Route path="/home">
    <Base Component={Home} />
  </Route>
  <Route path="/configuracion">
    <Base Component={ConfiguracionUsuario} />
  </Route>
  
  <!-- Administrador -->
  <Route path="/usuarios-sistema">
    <Base Component={ActivarDesactivarCuentas} />
  </Route>
  <Route path="/gestion-descuentos">
    <Base Component={GestionDescuentos} />
  </Route>
  <Route path="/descuentos-usuarios">
    <Base Component={DescuentosUsuarios} />
  </Route>
  <Route path="/gestion-promociones">
    <Base Component={GestionPromociones} />
  </Route>
  <Route path="/promociones-productos">
    <Base Component={PromocionesProductos} />
  </Route>
  <Route path="/usuarios-problemas">
    <Base Component={SeguimientoUsuarios} />
  </Route>
  <Route path="/crear-cuenta">
    <Base Component={CrearCuentas} />
  </Route>
  <Route path="/admin/gestion-categorias">
    <Base Component={GestionCategorias} />
  </Route>
  <Route path="/admin/gestion-marcas">
    <Base Component={GestionMarcas} />
  </Route>
  <Route path="/admin/gestion-productos">
    <Base Component={GestionProductos} />
  </Route>
  <Route path="/seguimiento-productos/admin">
    <Base Component={EstadoProductosComprados} />
  </Route>
  <Route path="/devoluciones/admin">
    <Base Component={DevolucionesAdmin} />
  </Route>
  <!-- <Route path. -->

  <!-- Usuario -->
  <Route path="/favoritos">
    <Base Component={FavoritosUsuario} />
  </Route>
  <Route path="/historial">
    <Base Component={HistorialComprasUsuario} />
  </Route>
  <Route path="/seguimiento">
    <Base Component={SeguimientoCompraUsuario} />
  </Route>
  <Route path="/quejas">
    <Base Component={QuejasUsuario} />
  </Route>
  <Route path="/devoluciones">
    <Base Component={DevolucionesUsuario} />
  </Route>
  <Route path="/pagos">
    <Base Component={PagosUsuarios} />
  </Route>
</Router>