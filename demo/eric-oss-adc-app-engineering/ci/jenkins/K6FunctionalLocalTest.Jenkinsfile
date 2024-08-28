#!/usr/bin/env groovy
package pipeline
pipeline {
    agent {
       label params.AGENT_LABEL
    }
     parameters {
  string(name: 'ARMDOCKER_USER_SECRET',
                defaultValue: 'cloudman-user-creds',
                description: 'ARM Docker secret')
        string(name: 'NAMESPACE',
		        defaultValue: '',
                description: 'Namespace to install the EO Chart' )
        string(name: 'KUBECONFIG_FILE',
		        defaultValue: 'hall923_config',
                description: 'Kubernetes configuration file to specify which environment to install on' )
        string(name: 'AGENT_LABEL',
                defaultValue: 'evo_docker_engine',
                description: 'Label of agent which be used')
    }
    options { timestamps () }
    stages {
        stage('Prepare') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout') {
            steps {
                checkout([$class: 'GitSCM', branches: [[name: '*/dummy_test']], extensions: [[$class: 'CleanBeforeCheckout']], userRemoteConfigs: [[credentialsId: 'eoadm100-user-creds', url: 'https://gerrit.ericsson.se/OSS/com.ericsson.oss.appEngineering/eric-oss-adc-app-engineering']]])
                sh "chmod +x -R ${env.WORKSPACE}"
            }
        }
       
        stage('K6 Testing') {
            steps {
                script {
                    withCredentials( [file(credentialsId: env.KUBECONFIG_FILE, variable: 'KUBECONFIG')]) {
                        sh "install -m 600 ${KUBECONFIG} ./admin.conf"
                        //sh "./ci/scripts/install_dependencies.sh ${env.KUBECONFIG} ${env.NAMESPACE} ."
                        sh "./ci/scripts/deployK6Pod.sh ${env.KUBECONFIG} ${env.NAMESPACE} ."
                    }
                }
            }
        }
        stage('Copy Report') {
            steps {
                script {
                    withCredentials( [file(credentialsId: env.KUBECONFIG_FILE, variable: 'KUBECONFIG')]) {
                        sh "install -m 600 ${KUBECONFIG} ./admin.conf"
                        sh "./ci/scripts/copyK6Report.sh ${env.KUBECONFIG} ${env.NAMESPACE} ."
                    }
                }
            }
        
            post {
            failure {
                withCredentials( [file(credentialsId: env.KUBECONFIG_FILE, variable: 'KUBECONFIG')]) {
                    sh "install -m 600 ${KUBECONFIG} ./admin.conf"
                    sh "./ci/scripts/ADP_logs.sh ${env.NAMESPACE}"     
                    }                
                }
            }
        }
    }
      post {
        always {
            archiveArtifacts 'test-output.json'
            archiveArtifacts 'result.html'
            archiveArtifacts 'k6-testsuite.log'
            archiveArtifacts artifacts: 'logs_*.tgz, logs/*', allowEmptyArchive: true

            publishHTML([allowMissing: true,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: '',
                reportFiles: 'result.html',
                reportName: 'Report',
                reportTitles: ''])
            cleanWs()
        }
    }
}

