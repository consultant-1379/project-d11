#!/bin/bash
############################################################################
# It is not official version of ADP logs collection script.
# This is modified by zolepan fork, used in OSS AppStaging pipelines.
############################################################################
############################################################################
# Latest official script version can located here:
# https://confluence.lmera.ericsson.se/pages/viewpage.action?spaceKey=ACD&title=Tools
############################################################################
############################################################################
# organization "Ericsson AB";                                              #
# contact " ADP Support via mail";                                         #
# description "Script to collect ADP logs for Support.                     #
#        Copyright (c) 2020 Ericsson AB. All rights reserved.";            #
############################################################################
# Author: EPRGGGZ Gustavo Garcia G.                                        #
# 1.0.0                                                                    #
# Script to collect logfiles for Kubernetes Cluster based on Spider input  #
# The script wil also collect HELM charts configuration                    #
# To use, execute collect_ADP_logs.sh <namespace>  <opt_min_to_collect>    #
#                                                                          #
############################################################################
############################################################################
#                          History                                         #
# 2021-08-06 EPRGGGZ    Version 1.0.0                                      #
#                       Improved logic to only gather prev logs if restart #
#                       Added DCED printouts under sip_kms_dced/DCED       #
#                       Added KVDBAG printouts on KVDBAG                   #
#                       Added script version on scriptversion.txt          #
#                       Added grep for disk and latency errors  under err  #
#                                                                          #
# 2021-04-09 XKHADOA    Collect dumpState, dumpConfig and Transport Dia    #
#                                                                          #
# 2021-03-26 EPRGGGZ    Enabled collection of ssd one more time for cmyp   #
#                                                                          #
# 2021-03-26 XKHADOA    Added Removed restart count check                  #
#                                                                          #
# 2021-03-26 EPRGGGZ    Added InternalCertificates                         #
#                                                                          #
# 2021-03-18 XKHADOA    Added collection of container init of all PODs     #
#                       Added check POD status before invoke exec the POD  #
#                       Added check if container is restarted              #
#                       Fixed event logs missing                           #
#                       Removed v option in tar command                    #
#                                                                          #
# 2021-02-19 EPRGGGZ    Added option to collect only certain amount of min #
#                       Added collection of container init for DCED        #
#                                                                          #
#                       Improvement on the basic checks                    #
# 2020-10-19 EPRGGGZ    Added information for ssd for CMYP                 #
# 2020-10-19 EPRGGGZ    Added information for basic health check on SE     #
#                                                                          #
# 2020-09-11 EPRGGGZ    Added information for init containers on KMS       #
#                                                                          #
# 2020-06-12 EPRGGGZ    Added support for helm 3 and helm 2                #
#                       Corrected problem on helm get                      #
#                       Added collection of Schemas and configurations CMM #
#                       Added collection init certificate SIP/TLS and KMS  #
#                       Added collection of previous logs from pods        #
#                       Added collection of envionment variables           #
#                       Added Basic checks for quicker troubleshooting     #
#                       Removed execution of obsolete CMYP                 #
#                                                                          #
#                                                                          #
#                                                                          #
#                                                                          #
#                                                                          #
# 2019-09-25  EPRGGGZ    Correcting wrong extension on log output for      #
#                        CMyang provider                                   #
#                                                                          #
# 2019-07-23  EPRGGGZ    Added the log collection for SIP-TLS              #
#                        and CMyang provider                               #
#                                                                          #
# 2019-01-25  EPRGGGZ     Fixed bug with events                            #
#                         Added PV                                         #
#                         Added cmm_logs for CM Mediator                   #
#                                                                          #
#                                                                          #
#                                                                          #
# 2019-01-23   Keith Liu   fix bug when get logs of pod which may have more#
#                          more than one container                         #
#                          add more resources for describe logs            #
#                          add timestamp in the log folder name and some   #
#                          improvement                                     #
#
############################################################################
#Fail if empty argument received
if [[ "$#" = "0" ]]; then
    echo "Wrong number of arguments"
    echo "Usage collect_ADP_logs.sh <Kubernetes_namespace>"
    echo "Optional: collect_ADP_logs.sh <Kubernetes_namespace> <hours/minutes/seconds_to_capture_to_current_time>"
    echo "ex:"
    echo "$0 default    #--- to gather the logs for namespace 'default'"
    echo "Optional: $0 default  30m   #--- to gather the last 30 min of logs for namespace 'default'"
    echo "Optional: $0 default  45s   #--- to gather the last 45 sec of logs for namespace 'default'"
    echo "Optional: $0 default  2h   #--- to gather the last  2 hours of logs for namespace 'default'"
    exit 1
fi
namespace=$1
# Validate namespace
kubectl get namespace $namespace &>/dev/null
if [ $? != 0 ]; then
  echo "ERROR: The namespace $namespace does not exist. You can use \"kubectl get namespace\" command to verify your namespace"
  echo -e $USAGE
  exit 1
fi
#Define time
time=0
if [[ "$#" = "2" ]]; then
        time=$2
fi
#Create a directory for placing the logs
log_base_dir=logs_${namespace}_$(date "+%Y-%m-%d-%H-%M-%S")
log_base_path=$PWD/${log_base_dir}
mkdir ${log_base_dir}
#Check if there is helm2  or helm3 deployment
# echo "Collect script 1.0.0" > $log_base_path/script_version.txt
helm version | head -1 >$log_base_path/helm_version.txt
if eval ' grep v3 $log_base_path/helm_version.txt'
then
        echo "HELM 3 identified"
        HELM='helm get all --namespace='${namespace}
else
        HELM='helm get --namespace='${namespace}
       echo $HELM
fi
get_describe_info() {
    echo "-Getting resources describe info-"
    des_dir=${log_base_path}/describe
    mkdir ${des_dir}
    for attr in statefulsets internalCertificates crd deployments services replicasets endpoints daemonsets persistentvolumeclaims configmap pods nodes jobs persistentvolumes rolebindings roles secrets serviceaccounts storageclasses ingresses httpproxy networkpolicies
        do
            dir=`echo $attr | tr '[:lower:]' '[:upper:]'`
            mkdir ${des_dir}/$dir
            kubectl --namespace ${namespace} get $attr > ${des_dir}/$dir/_$attr.txt
            echo "Getting describe information on $dir.."
            for i in `kubectl --namespace ${namespace} get $attr | grep -v NAME | awk '{print $1}'`
                do
                    kubectl --namespace ${namespace}  describe  $attr  $i > ${des_dir}/$dir/$i.yaml
                done &
        done
        wait
}
get_events() {
    echo "-Getting list of events -"
    event_dir=$log_base_path/describe/EVENTS
    mkdir -p $event_dir
    kubectl --namespace ${namespace} get events > $event_dir/events.txt
}
get_pods_logs() {
    echo "-Getting logs per POD-"
    logs_dir=${log_base_path}/logs
    mkdir ${logs_dir}
    mkdir ${logs_dir}/env
    kubectl --namespace ${namespace} get pods -o wide > ${logs_dir}/_kube_podstolog.txt
    for i in `kubectl --namespace ${namespace} get pods | grep -v NAME | awk '{print $1}'`
        do
            pod_status=$(kubectl --namespace ${namespace} get pod $i -o jsonpath='{.status.phase}')
            pod_restarts=$(kubectl --namespace ${namespace} get pod $i |grep -vi restarts|awk '{print $4}')
            for j in `kubectl --namespace ${namespace} get pod $i -o jsonpath='{.spec.containers[*].name}'`
                do
                    kubectl --namespace ${namespace} logs $i -c $j --since=$time> ${logs_dir}/${i}_${j}.txt
                    if [[ "$pod_restarts" > "0" ]]; then
                    kubectl --namespace ${namespace} logs $i -c $j -p > ${logs_dir}/${i}_${j}_prev.txt &2>/dev/null
                    fi
                    # Only exec Pod in Running state
                    if [[ "$pod_status" == "Running" ]]; then
                        kubectl --namespace ${namespace} exec  $i -c $j -- env > ${logs_dir}/env/${i}_${j}_env.txt
                    fi
                done &
            init_containers=$(kubectl --namespace ${namespace} get pod $i -o jsonpath='{.spec.initContainers[*].name}')
            for j in $init_containers
                do
                    kubectl --namespace ${namespace} logs $i -c $j --since=$time> ${logs_dir}/${i}_${j}.txt
                    if [[ "$pod_restarts" > "0" ]]; then
                    kubectl --namespace ${namespace} logs $i -c $j -p > ${logs_dir}/${i}_${j}_prev.txt &2>/dev/null
                    fi
                done &
        done
        wait
}
get_helm_info() {
    echo "-Getting Helm Charts for the deployments-"
    helm_dir=${log_base_path}/helm
    mkdir ${helm_dir}
    helm --namespace ${namespace} list -a > ${helm_dir}/_helm_deployments.txt
    for i in `helm --namespace ${namespace} list -a | grep -v NAME | awk '{print $1}'`
        do
            echo $HELM $i
            $HELM $i > ${helm_dir}/$i.txt
            helm get values --namespace=${namespace} $i > ${helm_dir}/${i}_user_values.txt
        done
}
cmm_log() {
    echo "-Verifying for CM logs -"
    cmm_log_dir=${log_base_path}/logs/cmm_log
    if (kubectl --namespace=${namespace} get pods | grep -i cm-med|grep Running)
      then
        mkdir ${cmm_log_dir}
        echo "CM Pods found running, gathering cmm_logs.."
          for i in `kubectl --namespace=${namespace} get pods | grep -i cm-med | awk '{print $1}'`
            do
               echo $i
              kubectl --namespace ${namespace} exec $i --  collect_logs > ${cmm_log_dir}/cmmlog_$i.tgz
            done
            #Checking for schemas and configurations
            POD_NAME=`kubectl --namespace ${namespace} get pods |grep cm-mediator|grep -vi notifier|head -1|awk '{print $1}'`
            kubectl --namespace ${namespace} exec $POD_NAME -- curl -X GET http://localhost:5003/cm/api/v1/schemas | json_pp > ${cmm_log_dir}/schemas.json
            kubectl --namespace ${namespace} exec $POD_NAME -- curl -X GET http://localhost:5003/cm/api/v1/configurations | json_pp >  ${cmm_log_dir}/configurations.json
            configurations_list=$(cat ${cmm_log_dir}/configurations.json | grep \"name\" | cut -d : -f 2 | tr -d \",)
            for i in $configurations_list
            do
                    kubectl --namespace ${namespace} exec $POD_NAME -- curl -X GET http://localhost:5003/cm/api/v1/configurations/$i|json_pp > ${cmm_log_dir}/config_$i.json
            done
            wait
    else
         echo "CM Containers not found or not running, doing nothing"
    fi
}
siptls_logs() {
    echo "-Verifying for SIP-TLS logs -"
    siptls_log_dir=${log_base_path}/logs/sip_kms_dced
    if (kubectl --namespace=${namespace} get pods | grep -i sip-tls)
      then
      mkdir ${siptls_log_dir}
        echo "SIP-TLS Pods found, gathering siptls_logs.."
          for i in `kubectl --namespace=${namespace} get pods | grep -i sip-tls | awk '{print $1}'`
            do
               echo $i
              kubectl --namespace ${namespace} exec $i -- /bin/bash /sip-tls/sip-tls-alive.sh && echo $? > ${siptls_log_dir}/alive_log_$i.out
              kubectl --namespace ${namespace} exec $i -- /bin/bash /sip-tls/sip-tls-ready.sh && echo $? > ${siptls_log_dir}/ready_log_$i.out
              kubectl logs --namespace ${namespace}  $i sip-tls > ${siptls_log_dir}/sip-tls_log__$i.out
              kubectl logs --namespace ${namespace}  $i sip-tls --previous > ${siptls_log_dir}/sip-tls-previous_log_$i.out
              kubectl --namespace ${namespace} exec $i -- env > ${siptls_log_dir}/env_log__$i.out
            done
            kubectl --namespace ${namespace} exec eric-sec-key-management-main-0 -c kms -- bash -c 'vault status -tls-skip-verify' > ${siptls_log_dir}/vault_status_kms.out
            kubectl --namespace ${namespace} exec eric-sec-key-management-main-0 -c shelter -- bash -c 'vault status -tls-skip-verify' > ${siptls_log_dir}/vault_status_shelter.out
            kubectl get crd --namespace ${namespace}  servercertificates.com.ericsson.sec.tls -o yaml  > ${siptls_log_dir}/servercertificates_crd.yaml
            kubectl get  --namespace ${namespace}  servercertificates -o yaml  > ${siptls_log_dir}/servercertificates.yaml
            kubectl get crd --namespace ${namespace}  clientcertificates.com.ericsson.sec.tls -o yaml  > ${siptls_log_dir}/clientcertificates_crd.yaml
            kubectl get  --namespace ${namespace}  clientcertificates -o yaml  > ${siptls_log_dir}/clientcertificates.out
            kubectl get crd --namespace ${namespace} certificateauthorities.com.ericsson.sec.tls -o yaml  > ${siptls_log_dir}/certificateauthorities_crd.yaml
            kubectl get  --namespace ${namespace}  certificateauthorities -o yaml  > ${siptls_log_dir}/certificateauthorities.out
            kubectl get  --namespace ${namespace}  internalcertificates.siptls.sec.ericsson.com  -o yaml  > ${siptls_log_dir}/internalcertificates.yaml
            kubectl get  --namespace ${namespace}  internalusercas.siptls.sec.ericsson.com  -o yaml  > ${siptls_log_dir}/internalusercas.yaml
            kubectl get secret --namespace ${namespace} -l com.ericsson.sec.tls/created-by=eric-sec-sip-tls > ${siptls_log_dir}/secrets_created_by_eric_sip.out
            pod_name=$(kubectl get po -n ${namespace} -l app=eric-sec-key-management -o jsonpath="{.items[0].metadata.name}")
            kubectl --namespace ${namespace} exec $pod_name -c kms -- env VAULT_SKIP_VERIFY=true vault status > ${siptls_log_dir}/kms_status_.out
    else
         echo "SIP-TLS Containers not found or not running, doing nothing"
    fi
}
cmy_log() {
    echo "-Verifying for CM Yang logs -"
    cmy_log_dir=${log_base_path}/logs/sssd_cmy_log
    if (kubectl --namespace=${namespace} get pods | grep -i yang|grep Running)
      then
        mkdir ${cmy_log_dir}
        echo "CM Yang Pods found running, gathering cmyang_logs.."
          for i in `kubectl --namespace=${namespace} get pods | grep -i yang | awk '{print $1}'`
            do
               echo $i
#              kubectl --namespace ${namespace} logs $i confd -p  > ${cmy_log_dir}/confd_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i notification-sender -p  > ${cmy_log_dir}/notification-sender_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i yang-ext -p  > ${cmy_log_dir}/yang-ext_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i cpa -p  > ${cmy_log_dir}/cpa_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i ypint -p  > ${cmy_log_dir}/ypint_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i sshd -p  > ${cmy_log_dir}/sshd_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i ss -p  > ${cmy_log_dir}/ss_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i init-db -p  > ${cmy_log_dir}/init-db_previous_$i.txt
#              kubectl --namespace ${namespace} logs $i confd   > ${cmy_log_dir}/confd_$i.txt
#              kubectl --namespace ${namespace} logs $i notification-sender   > ${cmy_log_dir}/notification-sender_$i.txt
#              kubectl --namespace ${namespace} logs $i yang-ext   > ${cmy_log_dir}/yang-ext_$i.txt
#              kubectl --namespace ${namespace} logs $i cpa   > ${cmy_log_dir}/cpa_$i.txt
#              kubectl --namespace ${namespace} logs $i ypint   > ${cmy_log_dir}/ypint_$i.txt
#              kubectl --namespace ${namespace} logs $i sshd   > ${cmy_log_dir}/sshd_$i.txt
#              kubectl --namespace ${namespace} logs $i ss   > ${cmy_log_dir}/ss_$i.txt
#              kubectl --namespace ${namespace} logs $i init-db   > ${cmy_log_dir}/init-db_$i.txt
              mkdir ${logs_dir}/sssd_$i/
              kubectl --namespace ${namespace} cp $i:/var/log/sssd   ${logs_dir}/ssd_$i/ -c sshd
            done
    else
         echo "CM Yang Containers not found or not running, doing nothing"
    fi
}
function diameter_log (){
  DIA_POD=$(kubectl --namespace ${namespace} get pod -l app=eric-stm-diameter -o name)
  pod_status=$(kubectl --namespace ${namespace} get $DIA_POD -o jsonpath='{.status.phase}')
  if [[ "$pod_status" == "Running" ]]; then
    diacc=${log_base_path}/logs/dia
    mkdir $diacc
    kubectl --namespace $namespace exec $DIA_POD -- curl -s http://localhost:20100/dumpState > ${diacc}/dumpState.txt
    kubectl --namespace $namespace exec $DIA_POD -- curl -s http://localhost:20100/troubleshoot/transportDump/v2 > ${diacc}/transport.txt
    kubectl --namespace $namespace exec $DIA_POD -- curl -s http://localhost:20100/dumpConfig > ${diacc}/dumpConfig.txt
  fi
}
basic_checks () {
    mkdir  ${log_base_path}/logs/err
    mkdir  ${log_base_path}/logs/SE
#    for i in `ls ${log_base_path}/logs/`
#    do
#            filename=`echo $i| awk '{print substr($1,1,length($1)-4)}'`
#            cat ${log_base_path}/logs/$i | egrep -i "err|warn|crit" > ${log_base_path}/logs/err/$filename.err.txt
#    done
     for i in `ls ${log_base_path}/logs/`
      do
             filename=`echo $i| awk '{print substr($1,1,length($1)-4)}'`
             log_path="${log_base_path}/logs/$i"
      if ! [ -d $log_path ]; then
             cat ${log_path} | egrep -i "err|warn|crit" > ${log_base_path}/logs/err/$filename.err.txt
             cat ${log_path} | egrep -i "failed to perform indices:data/write/bulk|latency|failed to send out heartbeat on time|disk|time out|timeout|timed out" > ${log_base_path}/logs/err/$filename.latency.txt
      fi
    done
    #cd ${log_base_path}/describe/PODS
    for i in `ls ${log_base_path}/describe/PODS`
    do
            version=`cat ${log_base_path}/describe/PODS/$i |grep "app.kubernetes.io/version"`
           echo $i $version >>${log_base_path}/describe/PODS/pods_image_versions.txt
   done
   #SE_POD=$(kubectl --namespace ${namespace} get pod -l  "app=eric-data-search-engine,role in (ingest-tls,ingest)" -o jsonpath="{.items[0].metadata.name}")
  pod_status=$(kubectl --namespace ${namespace} get  pods | grep search-engine|wc -l)
  if [[ "$pod_status" > "0" ]]; then
   esRest="kubectl -n ${namespace} exec -c searchengine $(kubectl get pods -n ${namespace} -l "app=eric-data-search-engine,role in (ingest-tls,ingest)" -o jsonpath="{.items[0].metadata.name}") -- /bin/esRest"
   $esRest GET /_cat/nodes?v>${log_base_path}/logs/SE/nodes.txt
   $esRest GET /_cat/indices?v>${log_base_path}/logs/SE/indices.txt
   $esRest GET /_cluster/health?pretty > ${log_base_path}/logs/SE/health.txt
   $esRest GET /_cluster/allocation/explain?pretty > ${log_base_path}/logs/SE/allocation.txt
    fi
   mkdir ${log_base_path}/logs/sip_kms_dced/DCED
   for i in `kubectl --namespace ${namespace} get pod |grep data-distributed-coordinator-ed|grep -v agent|awk '{print $1}'`
   do
           echo $i
           kubectl --namespace ${namespace} exec $i -- etcdctl member list -w fields >  ${log_base_path}/logs/sip_kms_dced/DCED/memberlist_$i.txt
           kubectl --namespace ${namespace} exec $i -- bash  -c 'ls /data/member/snap -lh' >  ${log_base_path}/logs/sip_kms_dced/DCED/sizedb_$i.txt
           kubectl --namespace ${namespace} exec $i -- bash  -c 'du -sh data/*;du -sh data/member/*;du -sh data/member/snap/db' >>  ${log_base_path}/logs/sip_kms_dced/DCED/sizedb_$i.txt
           kubectl --namespace ${namespace} exec $i -- etcdctl  endpoint status --endpoints=:2379 --insecure-skip-tls-verify=true -w fields>  ${log_base_path}/logs/sip_kms_dced/DCED/endpoints_$i.txt
           kubectl --namespace ${namespace} exec $i -- etcdctl user list >  ${log_base_path}/logs/sip_kms_dced/DCED/user_list$i.txt
   done
   if (kubectl --namespace=${namespace} get pods | grep -i kvdb-ag)
      then
      mkdir ${log_base_path}/logs/KVDBAG
   for i in `kubectl --namespace ${namespace} get pods|grep -i kvdb-ag|awk '{print $1}'`
   do
           echo $i
  kubectl --namespace ${namespace} cp $i:/opt/dbservice/data/logs ${log_base_path}/logs/KVDBAG/dbservicedatalogs$i/
  kubectl --namespace ${namespace} cp $i:/opt/dbservice/data/stats ${log_base_path}/logs/KVDBAG/dbservicedatastats$i/
   done
  fi
  }
compress_files() {
    echo "Generating tar file and removing logs directory..."
    tar cfz $PWD/${log_base_dir}.tgz ${log_base_dir}
    echo  -e "\e[1m\e[31mGenerated file $PWD/${log_base_dir}.tgz, Please collect and send to ADP Support!\e[0m"
    rm -r $PWD/${log_base_dir}
}
get_helm_info &
get_describe_info &
get_events &
get_pods_logs &
# cmm_log
# siptls_logs
# cmy_log
# diameter_log
wait
basic_checks
compress_files