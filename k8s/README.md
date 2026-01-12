# Kubernetes Deployment Guide

## Prerequisites
- Kubernetes cluster running
- kubectl configured
- Docker images built and available

## Build Docker Images (if not already built)
```bash
# Build backend image
docker build -t opex-3tier-backend:latest .

# If using local Kubernetes (minikube/kind), load images
# For minikube:
minikube image load opex-3tier-backend:latest

# For kind:
kind load docker-image opex-3tier-backend:latest
```

## Deploy to Kubernetes

### 1. Create namespace and configurations
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mysql-initdb-configmap.yaml
```

### 2. Deploy MySQL
```bash
kubectl apply -f k8s/mysql-pvc.yaml
kubectl apply -f k8s/mysql-deployment.yaml

# Wait for MySQL to be ready
kubectl wait --for=condition=ready pod -l app=mysql -n opex-app --timeout=120s
```

### 3. Deploy Backend
```bash
kubectl apply -f k8s/backend-deployment.yaml

# Wait for backend to be ready
kubectl wait --for=condition=ready pod -l app=backend -n opex-app --timeout=120s
```

### 4. Deploy Frontend
```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

### 5. Check deployment status
```bash
kubectl get all -n opex-app
```

### 6. Access the application

For LoadBalancer (cloud providers):
```bash
kubectl get svc frontend-service -n opex-app
# Use the EXTERNAL-IP shown
```

For local clusters (minikube/kind):
```bash
# Port forward frontend
kubectl port-forward -n opex-app svc/frontend-service 8080:80

# Access at http://localhost:8080
```

## Useful Commands

```bash
# View logs
kubectl logs -n opex-app -l app=backend
kubectl logs -n opex-app -l app=frontend
kubectl logs -n opex-app -l app=mysql

# Describe resources
kubectl describe deployment backend -n opex-app
kubectl describe pod -l app=backend -n opex-app

# Execute commands in pods
kubectl exec -it -n opex-app deployment/mysql -- mysql -u root -p

# Scale deployments
kubectl scale deployment backend -n opex-app --replicas=3

# Delete all resources
kubectl delete namespace opex-app
```

## Update Secrets

To update passwords, encode them in base64:
```bash
echo -n "YourPassword" | base64
```

Then update k8s/secret.yaml with the new base64 values.

## Troubleshooting

```bash
# Check pod status
kubectl get pods -n opex-app

# View events
kubectl get events -n opex-app --sort-by='.lastTimestamp'

# Check pod details
kubectl describe pod <pod-name> -n opex-app
```
