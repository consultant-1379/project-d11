/**
 *
 */
import {htmlReport} from "/modules/plugins/eric-k6-static-report-plugin/eric-k6-static-report-plugin.js"
import http from 'k6/http';
import {
    check,
    sleep,
    group
} from 'k6';
import {
    textSummary
} from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import usecase1 from "./use_cases/VES/VES.js"
import usecase2 from "./use_cases/moc-ctr.js"
import usecase3 from "./use_cases/SFTP-FT_and_5gpmevt_metrics.js"
//import usecase4 from "./use_cases/five-g-metrics.js"


export const options = {
    insecureSkipTLSVerify: true,
    scenarios: {
        case1: {
            exec: 'case1',
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '20m',

        },
        case2: {
            exec: 'case2',
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 1,
            maxDuration: '20m',
        },
        case3: {
            exec: 'case3',
            startTime: '1s',
            executor: 'per-vu-iterations',
            vus: 1,
            maxDuration: '640s',
            iterations: 1,

        },
        /*case4: {
            exec: 'case4',
            startTime: '1s',
            executor: 'per-vu-iterations',
            vus: 1,
            maxDuration: '20m',
            iterations: 1,

        },*/


    }

}

export function handleSummary(data) {
    return {
        '/tmp/result.html': htmlReport(data),
        '/tmp/test-output.json': JSON.stringify(data),
        stdout: textSummary(data, {
            indent: ' ',
            enableColors: true
        }),

    };
}

export function case1() {
    usecase1();
}

export function case2() {
    usecase2();
}
export function case3() {
    usecase3();
}
/*export function case4() {
    usecase4();
}*/