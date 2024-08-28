#!/bin/bash
KUBECONFIG=$1
NAMESPACE=$2
echo '
apiVersion: v1
stringData:
  eric-data-sftp-local-users-cfg.json: |-
    {
        "description" : "To define users which will be created in local SFTP Server Service. Normally customers login SFTP Server Service with these users when local way is configured.",
        "users" : [
            {
                "username" : "demo",
                "password" : "demo",
                "roles" :
                [
                    "system-admin",
                    "operator"
                ],
                "homeDirectory" : "/home/system-admin"
            },
            {
                "username" : "reader",
                "password" : "Cd,ef,gh,ij1!",
                "roles" :
                [
                    "readonly"
                ],
                "homeDirectory" : "/home/reader"
            }
        ]
    }
kind: Secret
metadata:
  name: eric-data-sftp-local-user-secrets
type: Opaque' | kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f -
# OPTION 1
helm upgrade --install sftp-server emberstack/sftp --set service.port=9023 --set image.pullPolicy=IfNotPresent --set fullnameOverride=sftp-server --set image.repository=selidockerhub.lmera.ericsson.se/emberstack/sftp --set image.tag=5.1.5 --set imagePullSecrets[0].name=armdocker -n ${NAMESPACE} --wait

# Note : try options 2,3, and 4 if option 1 does not work.
# OPTION 2
#helm upgrade --install sftp-server emberstack/sftp --set service.port=9023 --set image.pullPolicy=IfNotPresent --set fullnameOverride=sftp-server --set image.repository=selidockerhub.lmera.ericsson.se/emberstack/sftp --set image.tag=5.1.5 --set imagePullSecrets[0].name=k8s-registry-secret -n ${NAMESPACE} --wait
# OPTION 3
#helm upgrade --install sftp-server emberstack/sftp --set service.port=9023 --set image.pullPolicy=IfNotPresent --set fullnameOverride=sftp-server --set image.repository=selidockerhub.lmera.ericsson.se/emberstack/sftp --set image.tag=5.1.5 --set imagePullSecrets[0].name=armdocker -n ${NAMESPACE}
# OPTION 4
##helm upgrade --install sftp-server emberstack/sftp --set service.port=9023 --set image.pullPolicy=IfNotPresent --set fullnameOverride=sftp-server --set image.repository=selidockerhub.lmera.ericsson.se/emberstack/sftp --set image.tag=5.1.5 --set imagePullSecrets[0].name=k8s-registry-secret -n ${NAMESPACE}
