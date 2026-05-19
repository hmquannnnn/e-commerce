pipeline {
    agent any

    environment {
        DOCKERHUB_USER = 'hmquannnnn'
        IMAGE_NAME     = 'uav-store-fe'
    }

    stages {
        stage('Prepare Environment') {
            steps {
                sh 'git config --global --add safe.directory "*"'
                script {
                    env.GIT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    echo "GIT_SHA=${env.GIT_SHA}"
                }
            }
        }

        stage('Install & Lint') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args  '-u root'
                    reuseNode true
                }
            }
            steps {
                sh 'corepack enable'
                sh 'corepack prepare pnpm@10.20.0 --activate'
                sh 'pnpm i'
                sh 'pnpm lint'
            }
        }

        stage('Type Check') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args  '-u root'
                    reuseNode true
                }
            }
            steps {
                sh 'corepack enable'
                sh 'corepack prepare pnpm@10.20.0 --activate'
                sh 'pnpm typecheck'
            }
        }

        stage('Docker Build & Push') {
            agent {
                docker {
                    image 'docker:24-cli'
                    args  '-v /var/run/docker.sock:/var/run/docker.sock -u root'
                    reuseNode true
                }
            }
            steps {
                script {
                    def sha  = env.GIT_SHA
                    def img  = "${DOCKERHUB_USER}/${IMAGE_NAME}"

                    withCredentials([usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                        sh "docker pull ${img}:latest || true"
                        sh "docker build --cache-from ${img}:latest -t ${img}:latest -t ${img}:${sha} ."
                        sh "docker push ${img}:latest"
                        sh "docker push ${img}:${sha}"
                        sh 'docker logout'
                        echo "Pushed ${img}:latest and ${img}:${sha}"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build and push completed successfully'
        }
        failure {
            echo 'Build failed'
        }
        always {
            echo 'Pipeline finished'
        }
    }
}
