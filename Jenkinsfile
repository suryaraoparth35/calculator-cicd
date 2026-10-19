pipeline {
    agent any
    options { timestamps(); disableConcurrentBuilds() }

    environment {
        K8S_NAMESPACE = 'default'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Build and Test') {
            steps {
                sh 'node --version'
                sh 'npm ci'
                sh 'npm test'
            }
        }
        stage('Build Docker Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
                    script {
                        env.IMAGE_NAME = "docker.io/${env.DH_USER.toLowerCase()}/calculator-cicd"
                    }
                    sh 'docker build --pull -t "$IMAGE_NAME:$IMAGE_TAG" .'
                }
            }
        }
        stage('Push Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DH_USER', passwordVariable: 'DH_TOKEN')]) {
                    sh '''
                        set +x
                        printf '%s' "$DH_TOKEN" | docker login -u "$DH_USER" --password-stdin
                        docker push "$IMAGE_NAME:$IMAGE_TAG"
                        docker logout
                    '''
                }
            }
        }
        stage('Deploy to Minikube') {
            steps {
                sh '''
                    sed "s|IMAGE_PLACEHOLDER|$IMAGE_NAME:$IMAGE_TAG|g" k8s/deployment.yaml > k8s/deployment.generated.yaml
                    kubectl apply -f k8s/deployment.generated.yaml -n "$K8S_NAMESPACE"
                    kubectl apply -f k8s/service.yaml -n "$K8S_NAMESPACE"
                    kubectl rollout status deployment/calculator-cicd -n "$K8S_NAMESPACE" --timeout=180s
                    rm -f k8s/deployment.generated.yaml
                '''
            }
        }
        stage('Verify') {
            steps {
                sh '''
                    kubectl get deployment,pods,service -l app=calculator-cicd -n "$K8S_NAMESPACE"
                    kubectl get deployment calculator-cicd -n "$K8S_NAMESPACE" -o jsonpath='{.status.readyReplicas}' | grep -q '2'
                    kubectl port-forward service/calculator-cicd 18080:80 -n "$K8S_NAMESPACE" >/tmp/calculator-cicd-port-forward.log 2>&1 & echo $! > /tmp/calculator-cicd-port-forward.pid
                    trap 'kill $(cat /tmp/calculator-cicd-port-forward.pid) 2>/dev/null || true' EXIT
                    for attempt in $(seq 1 20); do curl --fail --silent http://127.0.0.1:18080/health && exit 0; sleep 2; done
                    echo 'Calculator health endpoint did not respond' >&2
                    exit 1
                '''
            }
        }
    }
    post {
        always {
            sh 'docker logout || true'
            sh 'rm -f k8s/deployment.generated.yaml'
        }
        success { echo "Deployed ${IMAGE_NAME}:${IMAGE_TAG} to Minikube." }
    }
}
