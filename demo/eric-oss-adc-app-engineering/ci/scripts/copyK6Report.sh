#!/bin/bash
KUBECONFIG=$1
NAMESPACE=$2
REPORT_PATH=$3
retries="10";
while [ $retries -ge 0 ]
do
  if [[ "$retries" -eq "0" ]]
    then
        echo no report file available
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs adc-k6-testsuite > ${REPORT_PATH}/k6-testsuite.log
        cat  ${REPORT_PATH}/k6-testsuite.log

        ERIC_OSS_SFTP_POD=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods |grep eric-oss-sftp-filetrans|grep Running|awk '{print $1}')
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${ERIC_OSS_SFTP_POD} > ${REPORT_PATH}/eric-oss-sftp-filetrans.log
        ERIC_OSS_fig_POD=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods |grep eric-oss-5gpmevt-filetx-proc|grep Running|awk '{print $1}')
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${ERIC_OSS_fig_POD} > ${REPORT_PATH}/eric-oss-5gpmevt.log
        ERIC_OSS_stub_POD=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods |grep eric-oss-file-notification-enm-stub|grep Running|awk '{print $1}')
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${ERIC_OSS_stub_POD} > ${REPORT_PATH}/enm-stub.log

        kubectl --namespace ${NAMESPACE} delete pod adc-k6-testsuite
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-sftp-server-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-data-catalog-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-fns-stub-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-subsys-policy
        exit 1
    elif ! kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} cp adc-k6-testsuite:/tmp/test-output.json ${REPORT_PATH}/test-output.json ;
    then
        let "retries-=1"
        echo report not available, Retries left = $retries :: Sleeping for 10 seconds
        sleep 10
    else
        echo report copied
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} cp adc-k6-testsuite:/tmp/result.html ${REPORT_PATH}/result.html;
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs adc-k6-testsuite > ${REPORT_PATH}/k6-testsuite.log
        cat  ${REPORT_PATH}/k6-testsuite.log

        ERIC_OSS_SFTP_POD=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods |grep eric-oss-sftp-filetrans|grep Running|awk '{print $1}')
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${ERIC_OSS_SFTP_POD} > ${REPORT_PATH}/eric-oss-sftp-filetrans.log
        ERIC_OSS_fig_POD=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods |grep eric-oss-5gpmevt-filetx-proc|grep Running|awk '{print $1}')
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${ERIC_OSS_fig_POD} > ${REPORT_PATH}/eric-oss-5gpmevt.log
        ERIC_OSS_stub_POD=$(kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} get pods |grep eric-oss-file-notification-enm-stub|grep Running|awk '{print $1}')
        kubectl --namespace ${NAMESPACE} --kubeconfig ${KUBECONFIG} logs ${ERIC_OSS_stub_POD} > ${REPORT_PATH}/enm-stub.log

        kubectl --namespace ${NAMESPACE} delete pod adc-k6-testsuite
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-sftp-server-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-data-catalog-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-fns-stub-policy
        kubectl --namespace ${NAMESPACE} delete networkpolicy/eric-adc-k6-subsys-policy
        COMMAND=$(cat "${REPORT_PATH}"/test-output.json | grep "\"passes\": 0" | wc -l)
        #COMMAND=$(jq 'select(.type=="Point") | select(.data.tags.expected_response=="false") | length' "${REPORT_PATH}"/test-output.json | wc -l)
        echo $COMMAND
        [ $COMMAND -eq 0 ] && echo "all requests are successful in the report" && exit 0
        echo "Failures detected in the report"
        exit 1
        break
    fi
done
