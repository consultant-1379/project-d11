/**
 *
 */
 
import http from 'k6/http';
import { check,sleep,group} from 'k6';

import {ObjectBuilder} from './ObjectBuilder.js';
import * as Constants from './Constants.js';


let objBuilder = new ObjectBuilder();
let testPost = objBuilder.createObject("POST");
let testGet = objBuilder.createObject("GET");
let testNegPost = objBuilder.createObject("NEG_POST");


let events;
let payload_evt = JSON.stringify(JSON.parse(open("./Adc-Json/" + Constants.VES_EVENT + ".json")));
let payload_evt_batch = JSON.stringify(JSON.parse(open("./Adc-Json/" + Constants.VES_EVENT_BATCH + ".json")));

export default function() {
    group('Sending traffic to VES collector', function() {
        let responses_ = runPost();
        for (let i = 0; i < responses_.length; i++) {
            if (responses_[i].url == Constants.ingress_url + Constants.VES_EVENT_URI)
                events = "Single Event ";
            else
                events = "Batch Event ";
            group('Verify posting ' + events + ' objects to event Listener', function() {
                console.log("Status : " + responses_[i].status + " Response :" + responses_[i].body);
                check(responses_[i], {
                    'Status Check 202': (res) => res.status === 202
                });
            })
        }
        // Negative scenario - Bad parameter (JSON does not conform to schema)
        let responses_neg = runNegPost();
        for (let i = 0; i < responses_neg.length; i++) {
            if (responses_[i].url == Constants.ingress_url + Constants.VES_EVENT_BATCH_URI)
                events = "Single Event "
            else
                events = "Batch Event "
            group('Verify posting Bad parameter (JSON does not conform to schema' + events + ' objects to event Listener', function() {

                console.log("Status : " + responses_neg[i].status + " Response :" + responses_neg[i].body);
                check(responses_neg[i], {
                    'Status 400 Err JSON does not conform to schema': (res) => (res.status === 400 && res.body.includes("JSON does not conform to schema") === true)
                });
            })
        }
        // Negative scenario - Bad parameter (Incorrect request api version) - providing wrong X-MinorVersion header
        const neg_params = {
            headers: {
                'Content-Type': 'application/json',
                'X-MinorVersion': '10' // providing wrong version
            },
        };

        group("Verify Negative scenario for Single Event- Bad parameter (Incorrect request api version) - providing wrong X-MinorVersion header", function() {
            let res_data = http.post(Constants.ingress_url + Constants.VES_EVENT_URI, payload_evt, neg_params);
            console.log("Status : " + res_data.status + " Response :" + res_data.body);
            check(res_data, {
                'Status 400 Err Incorrect request api version': (res) => (res.status === 400 && res.body.includes("Incorrect request api version") === true)
            });
        })
        group("Verify Negative scenario for Batch Event- Bad parameter (Incorrect request api version) - providing wrong X-MinorVersion header", function() {
            let res_data_batch = http.post(Constants.ingress_url + Constants.VES_EVENT_BATCH_URI, payload_evt_batch, neg_params);
            console.log("Status : " + res_data_batch.status + " Response :" + res_data_batch.body);
            check(res_data_batch, {
                'Status 400 Err Incorrect request api version': (res) => (res.status === 400 && res.body.includes("Incorrect request api version") === true)
            });
        })
        // Negative scenario - Bad parameter (Incorrect request Content-Type)
        const neg_params2 = {
            headers: {
                'Content-Type': 'application/xml',
                'X-MinorVersion': '2'
            },
        };
        group("Verify Negative scenario for Single event- Bad parameter (Incorrect request Content-Type)", function() {
            let res_data2 = http.post(Constants.ingress_url + Constants.VES_EVENT_URI, payload_evt, neg_params2);
            console.log("Status : " + res_data2.status + " Response :" + res_data2.body);
            check(res_data2, {
                'Status 400 Err Incorrect request Content-Type': (res) => (res.status === 400 && res.body.includes("Incorrect request Content-Type") === true)
            });
        })
        group("Verify Negative scenario for Batch event- Bad parameter (Incorrect request Content-Type)", function() {
            let res_data_batch2 = http.post(Constants.ingress_url + Constants.VES_EVENT_BATCH_URI, payload_evt_batch, neg_params2);
            console.log("Status : " + res_data_batch2.status + " Response :" + res_data_batch2.body);
            check(res_data_batch2, {
                'Status 400 Err Incorrect request Content-Type': (res) => (res.status === 400 && res.body.includes("Incorrect request Content-Type") === true)
            });
        })
        // Negative scenario - Bad parameter (Incorrect JSON payload) - Providing text instead JSON data
        const params = {
            headers: {
                'Content-Type': 'application/json',
                'X-MinorVersion': '2'
            },
        };
        group("Verify Negative scenario -Single Event- Bad parameter (Incorrect JSON payload) - Providing text instead JSON data", function() {
            let res_wrong = http.post(Constants.ingress_url + Constants.VES_EVENT_URI, Constants.VES_EVENT_WRONG, params);
            console.log("Status : " + res_wrong.status + " Response :" + res_wrong.body);
            check(res_wrong, {
                'Status 400 Err Incorrect JSON payload': (res) => (res.status === 400 && res.body.includes("Invalid json content!") === true)
            });
        })
        group("Verify Negative scenario -Batch Event- Bad parameter (Incorrect JSON payload) - Providing text instead JSON data", function() {
            let res_wrong_batch = http.post(Constants.ingress_url + Constants.VES_EVENT_BATCH_URI, Constants.VES_EVENT_WRONG, params);
            console.log("Status : " + res_wrong_batch.status + " Response :" + res_wrong_batch.body);
            check(res_wrong_batch, {
                'Status 400 Err Incorrect JSON payload': (res) => (res.status === 400 && res.body.includes("Invalid json content!") === true)
            });
        })
        // GET call validation
        let get_res = runGet();
        for (let i = 0; i < get_res.length; i++) {
            group("Verify Get call return 200" + ".", function() {
                console.log("Status : " + get_res[i].status + " Response :" + get_res[i].body);
                check(get_res[i], {
                    'Get Call Status 200 Msg Welcome to VESCollector': (res) => (res.status === 200 && res.body.includes("Welcome to VESCollector") === true)
                });
            })
        }
    })
}
    
    
export function runGet() {
    return http.batch(testGet.getEndpointsByVerb("GET"));
}
export function runPost() {
    return http.batch(testPost.getEndpointsByVerb("POST"));
}
export function runNegPost() {
    return http.batch(testNegPost.getEndpointsByVerb("NEG_POST"));
}
