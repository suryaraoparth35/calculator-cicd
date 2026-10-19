# Clear Calculator: CI/CD starter project

A clean, responsive calculator with add, subtract, multiply, and divide. The project includes automated unit tests, a Dockerfile, Jenkins pipeline, and Kubernetes Deployment and Service manifests.

## Project files

- `public/` - calculator website and shared arithmetic module
- `calculator.test.js` - automated tests run by the pipeline
- `server.js` - Node HTTP server and `/health` endpoint
- `Dockerfile` - small non-root production container
- `Jenkinsfile` - checkout, test, Docker build/push, Minikube deploy, and health verification
- `k8s/` - Kubernetes Deployment and NodePort Service

## Run locally

Requires Node.js 22 or later.

```sh
npm ci
npm test
npm start
```

Open `http://localhost:8080`.

## Set up the pipeline

1. Create a GitHub repository and push the contents of this project folder to its `main` branch.
2. Create a public Docker Hub repository named `calculator-cicd`.
3. On the Linux machine that runs the Jenkins agent, install Node.js/npm, Docker, kubectl, Minikube, and curl. Run Minikube and configure the Jenkins agent user so `docker info` and `kubectl get nodes` both work.
4. In Jenkins, install the Pipeline and Git plugins. Create a Pipeline job with **Pipeline script from SCM**, set the GitHub repository URL, branch `main`, and script path `Jenkinsfile`.
5. Add a Jenkins credential of type **Username with password**, ID `dockerhub-creds`. Enter your Docker Hub username and a Docker Hub access token with read/write permission. Do not commit the token.
6. Confirm the Jenkins agent's current Kubernetes context is the intended Minikube cluster. The pipeline deploys into the `default` namespace.
7. Run the job. It tags the image with the Jenkins build number, pushes it to Docker Hub, applies the Kubernetes manifests, waits for two replicas, and checks `/health` through a temporary port-forward.

## Open the deployed app

The Service uses NodePort `30080`. On the Minikube host, check the service with:

```sh
kubectl get pods,service -l app=calculator-cicd
minikube ip
```

Try `http://<MINIKUBE_IP>:30080/` from a machine that can reach that Minikube IP. For an EC2-hosted Minikube using Docker driver, the Minikube IP may be private to the host; the CI pipeline's health check uses port-forwarding for that reason. For temporary access from a browser, run on the EC2 host:

```sh
kubectl port-forward --address 0.0.0.0 service/calculator-cicd 3000:80
```

Then allow inbound TCP `3000` only from your IP in the EC2 security group and open `http://<EC2_PUBLIC_IP>:3000/`. Keep the port-forward process running while you use the page, then stop it.

## Demonstrate a second deployment

After the first successful Jenkins run, edit a visible heading or color in `public/index.html` or `public/styles.css`, commit and push to GitHub, then run the Jenkins job again. Confirm a new build-number image tag was pushed and the Deployment rollout completed.
