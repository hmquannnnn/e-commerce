pipeline {
    agent { docker { 
			image 'node:20-alpine' 
			} 
		}
    stages {
				stage('Set up & Install dependencies') {
					steps {
						sh 'corepack enable'
						sh 'corepack prepare pnpm@10.20.0 --activate'

						sh 'pnpm i'
					}
				}
				stage('Lint & Format Check') {
					steps {
						sh 'pnpm lint'
					}
				}
				stage('Type Check') {
					steps {
						sh 'pnpm typecheck'
					}
				}
        stage('Build app') {
            steps {
                sh 'pnpm build'
            }
        }
				stage('Check build') {
					steps {
						sh 'ls -al .next'
					}
				}
    }
		post {
			success {
				echo 'Build successfully'
			}
			failure {
				echo 'Build failed'
			}
			always {
				echo 'Build completed'
			}
		}
}