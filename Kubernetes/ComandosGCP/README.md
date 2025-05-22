```sh
# Iniciar con otra cuenta (si ya se tiene una primera)
gcloud auth login

! Aqui se iniciarán credenciales otra vez con google por lo que exis eso ya esta en otro manual de la práctica

# Ver cuentas
gcloud auth list

# Selecionar cuenta GCP para trabajar
gcloud config set account <cuenta de la lista>

# Borrar cluster de configuración
kubectl config delete-cluster <cluster>

# En caso de no saber el cluster
cat ~/.kube/config
```

```sh
gcloud config set compute/region us-central1
```

```sh
# Servira para hacer pruebas internamente de los pods
kubectl run -i --tty --rm curlpod --image=curlimages/curl --namespace=proyecto-sa -- /bin/sh

curl -v http://<servicio>:<puerto>/
```

```sh
gcloud services enable \
  container.googleapis.com \
  compute.googleapis.com \
  iam.googleapis.com
```

```sh
# Primera VCP
gcloud compute networks create vpc-sa-central1 --subnet-mode=custom # Para la primera

# Con 64 hosts vamos de sobra (bueno... 62)
gcloud compute networks subnets create subred-sa-central1 \
  --network=vpc-sa-central1 \
  --region=us-central1 \
  --range=10.0.0.0/26

gcloud compute firewall-rules create firewall-sa-central1 \
  --network=vpc-sa-central1 \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0

# Segunda VCP
gcloud compute networks create vpc-sa-east1 --subnet-mode=custom

gcloud compute networks subnets create subred-sa-east1 \
  --network=vpc-sa-east1 \
  --region=us-east1 \
  --range=10.0.0.0/26

gcloud compute firewall-rules create firewall-sa-east1 \
  --network=vpc-sa-east1 \
  --direction=INGRESS \
  --action=ALLOW \
  --rules=tcp:80,tcp:443 \
  --source-ranges=0.0.0.0/0
```

```sh
gcloud container clusters create proyecto-sa \
  --num-nodes=2 \
  --disk-type=pd-standard \
  --machine-type=e2-medium \
  --region=us-central1 \
  --enable-ip-alias \
  --network=vpc-sa-central1 \
  --subnetwork=subred-sa-central1 \
  --disk-size=45GB

gcloud container clusters create proyecto-sa \
  --num-nodes=2 \
  --disk-type=pd-standard \
  --machine-type=e2-standard-2 \
  --region=us-central1 \
  --enable-ip-alias \
  --network=vpc-sa-central1 \
  --subnetwork=subred-sa-central1 \
  --disk-size=45GB

# Este contenedor o cluster (soft) mejor si se hace con autopilot (para evitar gastos innecesarios de recursos)
```

- Configrar acceso con kubectl (revisar id del proyecto)

```sh
# Conectar cluster
gcloud container clusters get-credentials software-avanzado --region us-central1 --project unique-axle-457801-j5
gcloud container clusters get-credentials soft --region us-east1 --project unique-axle-457801-j5

# Verificar conexión
kubectl get nodes

kubectl apply -f ./Namespaces/namespace-project.yaml
kubectl apply -f ./Config/configMap.yaml
kubectl apply -f ./Secrets/secret.yaml

# Agregar
kubectl apply -f ./Deployments/usuarios.yaml
kubectl apply -f ./Deployments/productos.yaml
kubectl apply -f ./Deployments/compras.yaml
kubectl apply -f ./Deployments/favoritos.yaml
kubectl apply -f ./Deployments/pagos.yaml
kubectl apply -f ./Deployments/devoluciones.yaml
kubectl apply -f ./Deployments/chatbot.yaml

# Eliminar
kubectl delete -f ./Deployments/usuarios.yaml
kubectl delete -f ./Deployments/productos.yaml
kubectl delete -f ./Deployments/compras.yaml
kubectl delete -f ./Deployments/favoritos.yaml
kubectl delete -f ./Deployments/pagos.yaml
kubectl delete -f ./Deployments/devoluciones.yaml
kubectl delete -f ./Deployments/chatbot.yaml

kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.4/deploy/static/provider/cloud/deploy.yaml
kubectl apply -f ./Ingress/ingress.yml

# Prometheus & Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update

helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace proyecto-sa \
  -f ./Monitoreo/Low.yaml

kubectl patch svc prometheus-grafana -n proyecto-sa -p '{"spec": {"type": "LoadBalancer"}}'

kubectl get secret prometheus-grafana --namespace proyecto-sa -o jsonpath="{.data.admin-password}" | base64 --decode ; echo

# Elastic Search
kubectl create -f ./Monitoreo/EKL/Elasticsearch.yaml

# Kibana
kubectl create -f ./Monitoreo/EKL/Kibana.yaml

# Fluentd
kubectl create -f ./Monitoreo/EKL/Fluent.yaml


kubectl delete -f ./Monitoreo/EKL/Elasticsearch.yaml
kubectl delete -f ./Monitoreo/EKL/Kibana.yaml
kubectl delete -f ./Monitoreo/EKL/Fluent.yaml
```