kubectl apply -f Namespaces/namespace-project.yaml
kubectl apply -f Config/configMap.yaml
kubectl apply -f Secrets/secret.yaml   
kubectl apply -f Deployments/usuarios.yaml
kubectl apply -f Deployments/productos.yaml
kubectl apply -f Deployments/pagos.yaml
kubectl apply -f Deployments/favoritos.yaml
kubectl apply -f Deployments/devoluciones.yaml
kubectl apply -f Deployments/compras.yaml
kubectl apply -f Deployments/chatbot.yaml
kubectl apply -f Ingress/ingress.yml


# ---------------------------------------------
kubectl delete -f Deployments/usuarios.yaml
kubectl delete -f Deployments/productos.yaml
kubectl delete -f Deployments/pagos.yaml
kubectl delete -f Deployments/favoritos.yaml
kubectl delete -f Deployments/devoluciones.yaml
kubectl delete -f Deployments/compras.yaml
kubectl delete -f Deployments/chatbot.yaml

# Para reiniciar todos los pods
kubectl get deployments -n proyecto-sa -o name | xargs -n1 -I {} kubectl rollout restart {} -n proyecto-sa

# Obtener pods de usuarios-ms
kubectl get pods -n proyecto-sa -l app=usuarios-ms
kubectl get endpoints usuarios-ms -n proyecto-sa