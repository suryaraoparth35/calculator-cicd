pipeline {
    agent any
    options { timestamps(); disableConcurrentBuilds() }
    triggers { pollSCM('H/2 * * * *') }

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
                    PF_PID_FILE=/tmp/calculator-cicd-public-forward.pid
                    PF_LOG=/tmp/calculator-cicd-public-forward.log
                    if [ -f "$PF_PID_FILE" ]; then
                        old_pid=$(cat "$PF_PID_FILE")
                        kill "$old_pid" 2>/dev/null || true
                        for attempt in $(seq 1 10); do
                            kill -0 "$old_pid" 2>/dev/null || break
                            sleep 1
                        done
                        rm -f "$PF_PID_FILE"
                    fi
                    if curl --fail --silent --max-time 2 http://127.0.0.1:3000/health >/dev/null; then
                        echo 'Port 3000 is already in use. Stop any manually started calculator port-forward once, then rerun this build.' >&2
                        exit 1
                    fi
                    JENKINS_NODE_COOKIE=dontKillMe nohup kubectl port-forward --address 0.0.0.0 service/calculator-cicd 3000:80 -n "$K8S_NAMESPACE" >"$PF_LOG" 2>&1 </dev/null &
                    echo $! > "$PF_PID_FILE"
                    for attempt in $(seq 1 20); do
                        if curl --fail --silent --max-time 2 http://127.0.0.1:3000/health; then
                            echo
                            exit 0
                        fi
                        sleep 2
                    done
                    echo 'Calculator public port-forward did not become ready; see /tmp/calculator-cicd-public-forward.log' >&2
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
