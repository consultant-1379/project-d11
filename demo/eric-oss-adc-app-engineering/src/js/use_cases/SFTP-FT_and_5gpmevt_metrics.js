/**
 *
 */

 import http from 'k6/http';
 import {
     check,
     sleep,
     group
 } from 'k6';
 
 
 //sftp-FT 
 //sftp metrics
 const Sftp_input_topic = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_input_kafka_messages_received_total";
 const Sftp_output_topic = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_output_kafka_messages_produced_successfully_total";
 const Bdr_upload_count = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_successful_bdr_uploads_total";
 const Sftp_success_file = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_successful_file_transfer_total";
 const Failed_bdr_upload = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_failed_bdr_uploads_total";
 const Failed_sftp_file = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_failed_file_transfer_total";
 const Failed_output_topic= "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:num_output_kafka_messages_failed_total";
 const ENM_ROP = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_file_notification_enm_stub:kafka_notifications_sftp_filetrans_per_rop";
 const bdr_data_volume ="http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:processed_bdr_data_volume_total";
 const counterfile_data_volume = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:processed_counter_file_data_volume_total";
 const sftp_processed_time ="http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_sftp_filetrans:processed_counter_file_time_total_seconds_sum";
 
 
 //5gpmevt metrics
 const fig_event_files_processed_total = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_5gpmevt_filetx_proc:event_files_processed_total";
 const fig_successful_file_transfer_total = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_5gpmevt_filetx_proc:num_successful_file_transfer_total";
 const fig_failed_file_transfer_total = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_5gpmevt_filetx_proc:num_failed_file_transfer_total";
 const fig_ENM_ROP = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_file_notification_enm_stub:kafka_notifications_event5g_per_rop";
 const fiveG_processed_time ="http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=eric_oss_5gpmevt_filetx_proc:processed_files_time_total_seconds_sum";
 

 let metrics_5g={'fig_event_files_processed_total':fig_event_files_processed_total,'fig_successful_file_transfer_total':fig_successful_file_transfer_total,'fig_failed_file_transfer_total':fig_failed_file_transfer_total,'fig_ENM_ROP':fig_ENM_ROP,'fiveG_processed_time':fiveG_processed_time};
 let metrics_sftp={'ENM_ROP':ENM_ROP,'Sftp_input_topic':Sftp_input_topic,'Sftp_output_topic':Sftp_output_topic,'Sftp_success_file':Sftp_success_file,'Bdr_upload_count':Bdr_upload_count,'Failed_bdr_upload':Failed_bdr_upload,'Failed_sftp_file':Failed_sftp_file,'Failed_output_topic':Failed_output_topic,'bdr_data_volume':bdr_data_volume,'counterfile_data_volume':counterfile_data_volume,'sftp_processed_time':sftp_processed_time};
 
 
 var Initial_Sftp_input,Initial_Sftp_output,Initial_sftpfile_success,Initial_ENM_ROP,Initial_bdr_upload,Initial_bdr_volume,Initial_failed_bdr,Initial_failed_op_topic,Initial_counterfile_volume,Initial_failed_sftp,Initial_processed_time_sftp;
 var Initial_files_processed_5g , Initial_successful_file_transfer_5g , Initial_failed_files_5g , Initial_processed_time_5g,ROP,Initial_enm_files_5g;
 
 var get_metrics_before_ROP,get_metrics_after_rop,get_metrics_5g,Processing_time_5g_from_test;
 
 export default function (){        
     let Values_before_ROP_sftp={};       //Mapping the value of metrics and utilise it for verification purpose in check.
     for(const metric in metrics_sftp){
         console.log(metric+' = '+metrics_sftp[metric]);
         get_metrics_before_ROP = http.get(metrics_sftp[metric]);
         console.log(get_metrics_before_ROP.status);
         console.log(get_metrics_before_ROP.body);
         let parse_data= JSON.parse(get_metrics_before_ROP.body);
         Values_before_ROP_sftp[metrics_sftp[metric]]= parse_data.data["result"]["0"]["value"]["1"];     //Assigning value to respective metrics
         console.log(Values_before_ROP_sftp[metrics_sftp[metric]]);
         }
 
     Initial_ENM_ROP = Values_before_ROP_sftp[metrics_sftp['ENM_ROP']];                 //Mapping values with respect to metrics
     Initial_Sftp_input = Values_before_ROP_sftp[metrics_sftp['Sftp_input_topic']];      
     Initial_Sftp_output = Values_before_ROP_sftp[metrics_sftp['Sftp_output_topic']];
     Initial_sftpfile_success = Values_before_ROP_sftp[metrics_sftp['Sftp_success_file']];
     Initial_bdr_upload = Values_before_ROP_sftp[metrics_sftp['Bdr_upload_count']];
     Initial_failed_op_topic = Values_before_ROP_sftp[metrics_sftp['Failed_output_topic']];
     Initial_failed_sftp = Values_before_ROP_sftp[metrics_sftp['Failed_sftp_file']];
     Initial_failed_bdr = Values_before_ROP_sftp[metrics_sftp['Failed_bdr_upload']];            
     Initial_counterfile_volume = Values_before_ROP_sftp[metrics_sftp['counterfile_data_volume']]; 
     Initial_bdr_volume = Values_before_ROP_sftp[metrics_sftp['bdr_data_volume']];  
     Initial_processed_time_sftp = Values_before_ROP_sftp[metrics_sftp['sftp_processed_time']]; 
 
      //Fetching the 5gpmevt file processed and ENM_ROP value ,Successful file processed before ROP
     let Values_before_ROP_5g={};
     for(const metrics in metrics_5g){
         console.log(metrics+' = '+metrics_5g[metrics]);
         get_metrics_5g = http.get(metrics_5g[metrics]);
         console.log(get_metrics_5g.status);
         console.log(get_metrics_5g.body);
         let parse_data_5g= JSON.parse(get_metrics_5g.body);
         Values_before_ROP_5g[metrics_5g[metrics]]= parse_data_5g.data["result"]["0"]["value"]["1"];     //Assigning value to respective metrics
         console.log(Values_before_ROP_5g[metrics_5g[metrics]]);
         }
     Initial_files_processed_5g = Values_before_ROP_5g[metrics_5g['fig_event_files_processed_total']]; 
     Initial_successful_file_transfer_5g = Values_before_ROP_5g[metrics_5g['fig_successful_file_transfer_total']];    ////Mapping values with respect to metrics
     Initial_failed_files_5g = Values_before_ROP_5g[metrics_5g['fig_failed_file_transfer_total']];
     Initial_processed_time_5g = Values_before_ROP_5g[metrics_5g['fiveG_processed_time']];
     Initial_enm_files_5g = Values_before_ROP_5g[metrics_5g['fig_ENM_ROP']];
     
     console.log("==================== SFTP-FT values Before ROP ==============================================")
     console.log("Inital value of input topic is ",Initial_Sftp_input);
     console.log("Inital value of output topic is ",Initial_Sftp_output);
     console.log("Inital value of BDR  is ",Initial_bdr_upload);    
     console.log("Inital count of failed sftp transfer ",Initial_failed_sftp);
     console.log("Inital count of failed bdr upload ",Initial_failed_bdr);
     console.log("Inital count of failed op_topic  ",Initial_failed_op_topic);
     console.log("Inital value of counterfile",Initial_counterfile_volume);
     console.log("Inital count of bdr",Initial_bdr_volume);
     console.log("Processed file before ROP",Initial_processed_time_sftp); 
     console.log("===============================================================================================");
 
 
     console.log("====================  5gpmevent metrics values Before ROP ====================================");
     console.log("Initial count of 5gpmevt processed file count :",Initial_files_processed_5g);
     console.log("Initial count of 5gpmevt Successfull file transfer :",Initial_successful_file_transfer_5g);
     console.log("Initial count of 5gpmevt files from ENM stub:",Initial_enm_files_5g);
     console.log("Initial count of 5gpmevt failed processes files:",Initial_failed_files_5g);
     console.log("5gpmevt processing time BeforeROP :",Initial_processed_time_5g);
     console.log("===============================================================================================");
 
 
     ////////////////////////////////////////////////////////////////////////////////////
     //////////////////////////////////////////////////////////////////////////////////////
 
     //ROP curl comment executing here
     ROP = http.get("http://eric-oss-file-notification-enm-stub:8080/generateRop");
     console.log(ROP.status);
     console.log(ROP.body);
     sleep(60);
     ////////////////////////////////////////////////////////////////////////////////////////////
     ////////////////////////////////////////////////////////////////////////////////////////////
 
 //After 15Mins verifying the input ,output topic ,successfull bdr upload ,failed bdr upload,failed sftp file transfer values.
     if(ROP.status == 200){
         let timeout_limit = 9 * 60;
         let processingTime = 60;   //Starting from 60 because already added 60 sleep time at 115 line.
 
         let get_enm = http.get(ENM_ROP);
         let enm_body = JSON.parse(get_enm.body);
         let enm_value_sftp = enm_body.data["result"]["0"]["value"]["1"];
 
         let enm_metrics = http.get(fig_ENM_ROP);
         console.log(enm_metrics.status);
         console.log(enm_metrics.body);
         let enm_count = JSON.parse(enm_metrics.body);
         let enm_value_fiveg = enm_count.data["result"]["0"]["value"]["1"]; //fetching the value(i.e value:4) from the payload.
 
         //Fetching the expected value by polling the metrics for every 10 seconds 
         while (processingTime <= timeout_limit) {
             let get_input_topic = http.get(Sftp_input_topic);
             let input_topic_response_body = JSON.parse(get_input_topic.body);
             let sftp_Actual_Final_count = input_topic_response_body.data["result"]["0"]["value"]["1"];
             let sftp_Expected_Final_count = Number(Initial_Sftp_input) + Number(enm_value_sftp); // 100+ 1400 = 1500
             
             let file_processed_sample_value = http.get(fig_event_files_processed_total);
             //console.log(file_processed_sample_value.status);
             //console.log(file_processed_sample_value.body);
             let fiveg_response_body = JSON.parse(file_processed_sample_value.body); // Parse the JSON file
             let fig_Actual_Final_count = fiveg_response_body.data["result"]["0"]["value"]["1"];
             let fig_Expected_Final_count = Number(Initial_files_processed_5g) + Number(enm_value_fiveg);
             console.log("===============Polling metrics to get Expected Value==============");
             console.log("Initial sftp_input topic  count ",Initial_Sftp_input);
             console.log("sftp ENM count ",enm_value_sftp);
             console.log("sftp Actual processed count ",sftp_Actual_Final_count);
             console.log("stp Expected processed count",sftp_Expected_Final_count);
 
             console.log("Initial 5g processed count ",Initial_files_processed_5g);
             console.log("5g ENM count ",enm_value_fiveg);
             console.log("5g Actual processed count ",fig_Actual_Final_count);
             console.log("5g Expected processed count",fig_Expected_Final_count);
             console.log("===================================================================");
            
             if(fig_Expected_Final_count == fig_Actual_Final_count){
                Processing_time_5g_from_test= processingTime;
                console.log("Processing Time for 5gpmevt",processingTime);
             }
 
             if (fig_Expected_Final_count == fig_Actual_Final_count && sftp_Expected_Final_count == sftp_Actual_Final_count && enm_value_sftp != 0 && enm_value_fiveg!=0 ){
                 console.log("The Actual and Expected Values are matched ,Testing started");
                 afterROP();       
             break;
             }
             else if (processingTime == 530) {
                 console.log("Either Actual or Expected Values are not same ,Testing started");
                 afterROP();            
             break;
             }
             sleep(10);
             processingTime += 10;
         }
     }
     else{
         console.log("ROP API return error other than 200 response ,Testing started");
         afterROP();
         }
     }
export function afterROP(){
    let Values_after_ROP_sftp={}; //Mapping the value of metrics and utilise it for verification purpose in check.
    group("Sftp-filtrans-File Transfer metrics check",function(){
    for(const metric in metrics_sftp){
    group('Check to launch metrics viewer ' + metric, function(){
    console.log(metric+' = '+metrics_sftp[metric]);
    get_metrics_after_rop = http.get(metrics_sftp[metric]);
    console.log(get_metrics_after_rop.status)
    console.log(get_metrics_after_rop.body)
    let data_parsed= JSON.parse(get_metrics_after_rop.body);
    Values_after_ROP_sftp[metrics_sftp[metric]]= data_parsed.data["result"]["0"]["value"]["1"];
    console.log(Values_after_ROP_sftp[metrics_sftp[metric]]); //Assigning each value to respective metrics.{ENM_ROP:19,Sftp_input_topic:15..}
    check(Values_after_ROP_sftp, {
        'status check 200': (r) => get_metrics_after_rop.status === 200,
        });
            })
            } 
          //Check Status code for ROP getting 200
         check(ROP, {
         'STUB generated ROP : Status Code should be 200' : (r) => ROP.status == 200,
         });
      
         let Result_ENM_stub = Values_after_ROP_sftp[metrics_sftp['ENM_ROP']];
         let Result_input_topic = Values_after_ROP_sftp[metrics_sftp['Sftp_input_topic']];      
         let Result_output_topic = Values_after_ROP_sftp[metrics_sftp['Sftp_output_topic']];
         let Result_sftpfile_success =Values_after_ROP_sftp[metrics_sftp['Sftp_success_file']];
         let Result_bdr_upload = Values_after_ROP_sftp[metrics_sftp['Bdr_upload_count']];
         let Result_failed_sftp = Values_after_ROP_sftp[metrics_sftp['Failed_sftp_file']];
         let Result_failed_bdr = Values_after_ROP_sftp[metrics_sftp['Failed_bdr_upload']];
         let Result_failed_op_topic = Values_after_ROP_sftp[metrics_sftp['Failed_output_topic']];
         let Result_bdr_volume = Values_after_ROP_sftp[metrics_sftp['bdr_data_volume']];
         let Result_counterfile_volume = Values_after_ROP_sftp[metrics_sftp['counterfile_data_volume']];
         let Result_processed_time_sftp_afterROP = Values_after_ROP_sftp[metrics_sftp['sftp_processed_time']];
 
         console.log("Result ENM_stub is ",Result_ENM_stub);
         console.log("Result_input_topic is  ",Result_input_topic);
         console.log("Result_output_topic is ",Result_output_topic);
         console.log("Result_sftpfile_download is ",Result_sftpfile_success);
         console.log("Result_bdr_upload is ",Result_bdr_upload);
         console.log("Result_failed_sftp is ",Result_failed_sftp);
         console.log("Result_failed_bdr is ",Result_failed_bdr);
         console.log("Result_failed_op_topic is ",Result_failed_op_topic);
         console.log("Result BDR volume ",Result_bdr_volume);
         console.log("Result Counter File ",Result_counterfile_volume);
     
         // Verifying BDR,input topic, output topic, successfull sftp transfer should be same
         let Diff_input_topic= Result_input_topic - Initial_Sftp_input;
         let Diff_output_topic= Result_output_topic - Initial_Sftp_output;
         let Diff_sftp_file= Result_sftpfile_success - Initial_sftpfile_success;
         let Diff_bdr_upload= Result_bdr_upload- Initial_bdr_upload;
         let Diff_enm_rop = Result_ENM_stub - Initial_ENM_ROP;
         let Diff_failed_Output_topic= Number(Result_failed_op_topic)-Number(Initial_failed_op_topic);
         let Diff_failed_bdr = Number(Result_failed_bdr)-Number(Initial_failed_bdr);
         let Diff_failed_SFTP_Download = Number(Result_failed_sftp)-Number(Initial_failed_sftp);
     
         console.log("Diff value of input topic is ",Diff_input_topic);
         console.log("Diff value of output topic is ",Diff_output_topic);
         console.log("Diff value of SFTP Download  is ",Diff_sftp_file);
         console.log("Diff value of BDR upload is ",Diff_bdr_upload);
         console.log("Diff count of failed sftp download ",Diff_failed_SFTP_Download);
         console.log("Diff count of failed bdr upload ",Diff_failed_bdr);
         console.log("Diff count of failed op_topic  ",Diff_failed_Output_topic);
         console.log("Diff value of enm_rop is ",Diff_enm_rop);
 
         //Diff for Counterfile and BDR volume data 
         let Final_counterfile_count = Result_counterfile_volume - Initial_counterfile_volume;
         console.log("Diff Counterfile volume count ",Final_counterfile_count);
     
         let Final_BDR_volume_count = Result_bdr_volume - Initial_bdr_volume;
         console.log("Diff BDR Volume count ",Final_BDR_volume_count);
     
         //Verifying Processing time difference befor and after ROP
         let Final_Processing_time_SFTP = Result_processed_time_sftp_afterROP - Initial_processed_time_sftp;
         console.log("Diff Processing time  ",Final_Processing_time_SFTP);
     
     
         group('After ROP time ', function() {
             check(Result_failed_bdr, {
             'Verify Count should be increased after 15mins - Input topic':(r) => Number(Diff_input_topic)>90,
             'Verify Count should be increased after 15mins - Output Topic':(r) => Number(Diff_output_topic)>90,
             'Verify Count should be increased after 15mins - SFTP File Download':(r) => Number(Diff_sftp_file) >90,
             'Verify Count should be increased after 15mins - BDR upload':(r) => Number(Diff_bdr_upload)>90,
             //'Verify increased by expected ROP': (r) => Number(Result_input_topic)!==0 && Number(Initial_Sftp_input)+Number(Initial_enm_rop)===Number(Result_input_topic),
             //'Verify input topic,output topic ,bdr upload count should be same' : (r) => Diff_input_topic == Diff_output_topic && Diff_input_topic == Diff_sftp_file && Diff_input_topic == Diff_bdr_upload && Diff_output_topic==Diff_bdr_upload && Diff_output_topic==Diff_bdr_upload,
             'Verify failed Output topic should  be zero' : (r) => Diff_failed_Output_topic < 10,
             'Verify failed bdr upload should  be zero' : (r) => Diff_failed_bdr < 10,
             'Verify failed SFTP Download should  be zero' : (r) => Diff_failed_SFTP_Download < 10,
             'Verify Counterfile Volume ' : (r) => Final_counterfile_count === Final_BDR_volume_count,                  
             'Verify Processing time should be less than 180 sec' : (r) => Final_Processing_time_SFTP < 180,
             });
         });                       
         })
         group("5gpmevent-File Transfer metrics check", function () {
         //Fetching the file processed and ENM_ROP value ,Successful file processed after ROP
         let Values_after_ROP_5g={};
         for(const metrics in metrics_5g){
             group('Check to launch metrics viewer ' + metrics, function() {
             console.log(metrics+' = '+metrics_5g[metrics]);
             get_metrics_5g = http.get(metrics_5g[metrics]);
             console.log(get_metrics_5g.status);
             console.log(get_metrics_5g.body);
             let parse_data_5g= JSON.parse(get_metrics_5g.body);
             Values_after_ROP_5g[metrics_5g[metrics]]= parse_data_5g.data["result"]["0"]["value"]["1"];     //Assigning value to respective metrics
             console.log(Values_after_ROP_5g[metrics_5g[metrics]]);
             check(Values_after_ROP_sftp, {
                 'status check 200': (r) => get_metrics_5g.status === 200,
                 });
             })
             }
             let Result_files_processed_5g = Values_after_ROP_5g[metrics_5g['fig_event_files_processed_total']]; 
             let Result_successful_file_transfer_5g = Values_after_ROP_5g[metrics_5g['fig_successful_file_transfer_total']];      //convert an object to a string
             let Result_failed_files_5g = Values_after_ROP_5g[metrics_5g['fig_failed_file_transfer_total']];
             let Result_processed_time_5g = Values_after_ROP_5g[metrics_5g['fiveG_processed_time']];
             let Result_enm_files_5g = Values_after_ROP_5g[metrics_5g['fig_ENM_ROP']];
 
                    
             // 5gpmevent -  Verifying Processing time difference befor and after ROP
             let fiveGpmevent_Final_Processing_time = Result_processed_time_5g - Initial_processed_time_5g;
         
             console.log("5gpmevent after ROP : ");
             console.log("5gpmevt processed file count AfterROP:",Result_files_processed_5g);
             console.log("5gpmevt Successfull file transfer AfterROP:",Result_successful_file_transfer_5g);
             console.log("5g processed time from test",Processing_time_5g_from_test);
             console.log("5gpmevt Processing time AfterROP from processing time metric: ",Result_processed_time_5g );
             console.log("5gpmevent diff Processing time from processing time metric: ",fiveGpmevent_Final_Processing_time);
         
             group('After ROP time ', function() {

             check(Result_files_processed_5g, {
                 'Verifying the count of successful files transfer plus ENM rop count should equal after rop count': (r) => Number(Result_successful_file_transfer_5g) !== 0 && Number(Initial_successful_file_transfer_5g) + Number(Result_enm_files_5g) == Number(Result_successful_file_transfer_5g),
                 'Verifying the after rop files count is more than before rop': (r) =>  Number(Initial_files_processed_5g) < Number(Result_files_processed_5g), // 0<4
                 'Verifying the condition of initial files count plus ENM rop count should be equal to after rop count ': (r) => Number(Result_files_processed_5g) !== 0 && Number(Initial_files_processed_5g) + Number(Result_enm_files_5g) == Number(Result_files_processed_5g), //0+4===4
                 'Verify failed file transfer count should  be zero': (r) => Number(Result_failed_files_5g) == 0, // 0===0
                 //'Verify 5gpmevent final processing time of 100 files should be less than 180sec': (r) =>  fiveGpmevent_Final_Processing_time < 180,
                 ["Verify 5gpmevent final processing time of 100 files should be less than 180sec , current value of processing time for 100 files is : " + fiveGpmevent_Final_Processing_time]: (r) =>  fiveGpmevent_Final_Processing_time < 180,
             });
                     })    
                    })      
                 }