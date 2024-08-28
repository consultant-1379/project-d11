import http from 'k6/http';
import {
    check,
    sleep,
    group
} from 'k6';


const CSM_EVENT_QUERY = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=";
//const CSM_PARSER = "http://parser-moc-ctr-file-transfer:80//traffic/test";
const CSM_PARSER = "http://eric-oss-adc-moc-ctr-file-transfer:80/traffic/test";
const PM_COUNTER_SENT_RATE = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=rate(csm_sent_event_count[180s])";
const PM_COUNTER_RECEIVED_RATE = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=rate(csm_received_event_count[180s])";
const PM_COUNTER_PROCESSED_RATE = "http://eric-pm-server:9090/metrics/viewer/api/v1/query?query=rate(csm_processed_event_count[180s])";

let event_count , verify_count;
let metrics = ["csm_received_event_count", "csm_sent_event_count", "csm_processed_event_count"]
let counters = [0, 0, 0]
let after_count = [0, 0, 0]

export default function() {
    group('Moc-ctr test case', function() {
        // Before moc-ctr store pm counter value
        for (let i = 0; i <= 2; i++) {
            group('Before eventcount Query the CSM Event Count' + metrics[i], function() {
                var before_counter = http.post(CSM_EVENT_QUERY + metrics[i], {});
                console.log("CSM_TEST: BEFORE: " + before_counter.body)
                let count_before_moc = JSON.parse(before_counter.body)
                counters[i] = count_before_moc.data["result"]["0"]["value"]["1"];
                console.log("CSM_TEST:  " + metrics[i] + " Before = " + counters[i])
                const res3 = check(before_counter, {
                    'Check status is 200 before_counter': (r) => before_counter.status === 200,
                    'Response should take less than 100ms 90% of the time': ['p(90)>100'],
                });
            });
        }
        sleep(60);
        // store event count for moc_ctr
        group('Post call towards to moc-ctr', function() {

            const getEvent = http.post(CSM_PARSER, {});
            let count_for_moc = JSON.parse(getEvent.body)
            event_count = count_for_moc.eventCount;
            console.log("CSM_TEST: MOC-CTR: # events sent " + event_count);
            const moc_ctr_parser = check(getEvent, {
                'Verify Response code should be 200 OK': (r) => getEvent.status === 200,
                'Response should take less than 100ms 90% of the time': ['p(90)>100'],
                'Verify Response should checked for eventCount': (r) => getEvent.body.includes("eventCount")
            });
            sleep(60)
        });

        // After moc-ctr count pm counter value after 30 sec
        for (let i = 0; i <= 2; i++) {
            group('After eventcount Query the CSM Event Count' +  metrics[i], function() {
                var after_counter = http.post(CSM_EVENT_QUERY +  metrics[i], {});
                console.log(after_counter.body);
                let count_after = JSON.parse(after_counter.body);
                after_count[i] = count_after.data["result"]["0"]["value"]["1"];
                console.log("CSM_TEST:  " + metrics[i] + " After = " + after_count[i]);
                const res3 = check(after_counter, {
                    'Check status is 200 after_counter': (r) => after_counter.status === 200,
                    'Response should take less than 100ms 90% of the time': ['p(90)>100'],
                  });
            });
        }
        for (let i = 0; i <= 2; i++) {
             group(' Check the CSM Event Count' +  metrics[i], function() {
                    verify_count = (after_count[i] - counters[i]);
                    console.log("CSM_TEST:  " + metrics[i] + " expected value = " + event_count + " before = " + counters[i] + " After = " + after_count[i] + " Actual Value = " + verify_count);
                    
                    const res3 = check(verify_count, {
                       'Verify CSM Event Counts increased by eventCount ': (r) => verify_count === event_count

                    });
                });
        }
    });
}