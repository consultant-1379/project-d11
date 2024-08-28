#!/bin/bash
KUBECONFIG=$1
NAMESPACE=$2
ADC_HOSTNAME=$3
docker build -t armdocker.rnd.ericsson.se/proj-edca-dev/k6-adc-testsuite:1.0.86 --build-arg hostname=${ADC_HOSTNAME} --no-cache -f ./deployment/Dockerfile .
docker push armdocker.rnd.ericsson.se/proj-edca-dev/k6-adc-testsuite:1.0.86

kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f ./deployment/charts/network-policy/eric-adc-k6-policy.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f ./deployment/charts/network-policy/eric-adc-sftp-server-policy.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f ./deployment/charts/network-policy/eric-adc-data-catalog-policy.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f ./deployment/charts/network-policy/eric-adc-fns-stub-policy.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f ./deployment/charts/network-policy/eric-adc-ssm-policy.yaml;
kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} apply -f ./deployment/charts/adc-k6pod.yaml;

echo "##Get all netpol##"
All_NETPOL=`kubectl get netpol --namespace ${NAMESPACE}`
echo "$All_NETPOL"

echo "##Get all pods##"
All_PODS=`kubectl get pods --namespace ${NAMESPACE}`
echo "$All_PODS"

echo "##Get all Ingress##"
All_Ingress=`kubectl get ingress --namespace ${NAMESPACE}`
echo "$All_Ingress"

echo "##Get all services##"
All_SVC=`kubectl get svc --namespace ${NAMESPACE}`
echo "$All_SVC" 

sleep 670

echo "##Sftp-server-details##"
sftp_server=`kubectl describe pod sftp-server --namespace ${NAMESPACE}`
echo "$sftp_server"

