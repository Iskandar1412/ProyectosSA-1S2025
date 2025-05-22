# Iniciar kubectl 

minikube start --v=5

minikube delete -- borar

-- Situacion de problemas con swap: sudo swapoff -a

# Verificar kubectl vivo

kubectl version --client

# apuntar kubectl

kubectl config use-context minikube

# Ver estado minikube

minikube status

# Apuntar cluster de minikube (para que ejecute con minikube, docker se ejecuta con minikube)

eval $(minikube -p minikube docker-env)

# Para que regrese a la normalidad (adios a kubernetes, docker se ejecuta ya localmente)

eval $(minikube docker-env -u)

# construir imagenes docker

docker build -t productos-ms:v1 .
docker build -t usuarios-ms:v1 .

# Aplicar deploys

kubectl apply -f deployment-productos.yaml
kubectl apply -f deployment-usuarios.yaml

kubectl apply -f service-productos.yaml

kubectl delete -f deployment-productos.yaml
kubectl delete -f service-productos.yaml

# como encontrar pod

kubectl get pods
kubectl get pods --all-namespaces

kubectl get deployments

kubectl get services

# redirigir puertos:

kubectl port-forward microservicio-productos-64f844d756-cn2qf 4000:4000
kubectl port-forward microservicio-usuarios-bdcccb6b7-vrgfz 5200:5200