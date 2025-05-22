! -----------------------------------
! Instalación Podman
! -----------------------------------

paru -S podman
paru -S podman-desktop

! -----------------------------------
! Crear red
! -----------------------------------

podman network create redProyecto


! -----------------------------------
! Crear imagenes
! -----------------------------------

podman build -t productos-ms:v1 .
podman build -t usuarios-ms:v1 .

! -----------------------------------
! Crear pods
! -----------------------------------

podman pod create --name podUsuarios --network redProyecto
podman run -d --pod podUsuarios --name usuarios-ms localhost/usuarios-ms:v1

podman pod create --name podProductos --network redProyecto
podman run -d --pod podProductos --name productos-ms localhost/productos-ms:v1


! -----------------------------------
! USADOS
! -----------------------------------

podman pod create --name podUsuarios -p 5200:5200
podman pod create --name podProductos -p 4000:4000

podman pod create --name podUsuarios --network redProyecto -p 5200:5200
podman pod create --name podProductos --network redProyecto -p 4000:4000
podman run -d --pod podUsuarios --name usuarios-ms localhost/usuarios-ms:v1
podman run -d --pod podProductos --name productos-ms localhost/productos-ms:v1


podman pod create --name pod_nginx --network redProyecto -p 8080:80
podman run -d --pod pod_nginx --name nginx-proxy -v ./nginx.conf:/etc/nginx/nginx.conf:ro docker.io/nginx
