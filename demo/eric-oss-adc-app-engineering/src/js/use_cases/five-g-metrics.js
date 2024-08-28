/*


BELOW USE CASE IS NOT CURRENTLY USED.THIS SCRIPT IS OLD AND JUST FOR REFERENCE 

*/












import http from 'k6/http';
import {
    check,
    sleep,
    group
} from 'k6';

const fig_event_files_processed_total = "http://eric-oss-5gpmevt-filetx-proc:33631/actuator/metrics/eric.oss.5gpmevt.filetx.proc:event.files.processed";
const fig_successful_file_transfer_total = "http://eric-oss-5gpmevt-filetx-proc:33631/actuator/metrics/eric.oss.5gpmevt.filetx.proc:num.successful.file.transfer";
const fig_failed_file_transfer_total = "http://eric-oss-5gpmevt-filetx-proc:33631/actuator/metrics/eric.oss.5gpmevt.filetx.proc:num.failed.file.transfer";
const fig_ENM_ROP = "http://eric-oss-file-notification-enm-stub:8080/actuator/metrics/eric.oss.file.notification.enm.stub:kafka.notifications.event5g.per.rop";


export default function() {
    group("5gpmevent-File Transfer metrics check", function() {
        let k = 1;
        while (k <= 3) {
            let fig_status_check = [];
            for (let j = 0; j < 7; j++) {
                let fig_tear = http.get(fig_event_files_processed_total); //Fetching the file-processed_metrics for every 10 second to verify values are stable.
                let fig_ch = JSON.parse(fig_tear.body);
                let fi_status = fig_ch["measurements"][0]["value"];
                fig_status_check.push(fi_status);
                sleep(10);
            }
            //Verifying all values are equal in the array.
            let fig_values_check = fig_status_check[0];
            console.log(fig_status_check);
            const fig_allEqual = arr => fig_status_check.every(val => val === fig_status_check[0]);
            const fi_result = fig_allEqual(fig_values_check, fig_values_check, fig_values_check, fig_values_check, fig_values_check, fig_values_check, fig_values_check); // Verify all values are equal
            if (fi_result) {
                //Fetching the file processed and ENM_ROP value ,Successful file processed before ROP
                let file_processed = http.get(fig_event_files_processed_total);
                console.log(file_processed.status);
                console.log(file_processed.body);
                let eventcount = JSON.parse(file_processed.body); // Parse the JSON file
                fig_Current_count = eventcount["measurements"][0]["value"];


                let successful_file_before_15 = http.get(fig_successful_file_transfer_total);
                console.log(successful_file_before_15.status);
                console.log(successful_file_before_15.body);
                let eventcount7 = JSON.parse(successful_file_before_15.body); // Parse the JSON file
                let Current_count7 = eventcount7["measurements"][0]["value"];

                sleep(900); //Waiting for ROP to get completed
                //Fetching the file processed and ENM_ROP value ,Successful file processed after ROP
                let file_processed_after_15 = http.get(fig_event_files_processed_total);
                console.log(file_processed_after_15.status);
                console.log(file_processed_after_15.body);
                let eventcount2 = JSON.parse(file_processed_after_15.body); // Parse the JSON file
                fig_After_15M = eventcount2["measurements"][0]["value"];

                let enm_metrics = http.get(fig_ENM_ROP);
                console.log(enm_metrics.status);
                console.log(enm_metrics.body);
                let enm_count = JSON.parse(enm_metrics.body);
                fig_enm_rop = enm_count["measurements"][0]["value"]; //fetching the value(i.e value:4) from the payload.

                let successful_file_after_15 = http.get(fig_successful_file_transfer_total);
                console.log(successful_file_after_15.status);
                console.log(successful_file_after_15.body);
                let eventcount3 = JSON.parse(successful_file_after_15.body); // Parse the JSON file
                let Current_count3 = eventcount3["measurements"][0]["value"];

                let failed_file_after_15 = http.get(fig_failed_file_transfer_total);
                console.log(failed_file_after_15.status);
                console.log(failed_file_after_15.body);
                let eventcount4 = JSON.parse(failed_file_after_15.body); // Parse the JSON file
                let Failed_file_tranfer = eventcount4["measurements"][0]["value"];

                check(Current_count3, {
                    'check status code is 200 - file processed': (r) => file_processed.status == 200,
                    'check status code is 200 - ENM': (r) => enm_metrics.status == 200,
                    'check status code is 200 - Failed transer total': (r) => failed_file_after_15.status == 200,
                    'check before and after successful file transer count': (r) => Current_count7 < Current_count3,
                    'Verify Count should be increased after ROP': (r) => fig_Current_count < fig_After_15M, // 0<4
                    'Verify increased by expected ROP': (r) => fig_After_15M !== 0 && fig_Current_count + fig_enm_rop === fig_After_15M, //0+4===4
                    'Verify failed file transfer should  be zero': (r) => Failed_file_tranfer === 0, // 0===0
                });
                break;
            } else if (k == 3) {
                console.log("Condition failed , ROP values are not stable.");
                group('After ROP time ', function() {
                    check(response, {
                        'Verify Count should be increased after ROP': (r) => fig_Current_count < fig_After_15M, // 0<4
                        'Verify increased by expected ROP': (r) => fig_After_15M !== 0 && fig_Current_count + fig_enm_rop === fig_After_15M, //0+4===4
                        'Verify failed file transfer should  be zero': (r) => Failed_file_tranfer === 0, // 0===0
                    });
                });
                break;
            } else {
                k++;
                console.log('waiting for ROP to complete...');
                sleep(150);
            }
        }
    })




}