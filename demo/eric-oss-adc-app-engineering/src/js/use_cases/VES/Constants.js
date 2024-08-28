//export const ingress_url = "http://ves.adc-new.hall923.rnd.gic.ericsson.se/"
//export const ingress_url = "http://adc.hart906.rnd.gic.ericsson.se/"
export const ingress_url = `${__ENV.hostname_url}`;
export const VES_EVENT = "ves-event" //file in Adc-Json folder
export const VES_EVENT_URI = "eventListener/v7" // REST Endpoint
export const VES_EVENT_BATCH = "ves-event-batch"
export const VES_EVENT_BATCH_URI = "eventListener/v7/eventBatch"
export const VES_HEALTH_CHECK = "healthcheck"

export const VES_EVENT_NEG = "ves-event-neg"
export const VES_EVENT_BATCH_NEG = "ves-event-batch-neg"
export const VES_EVENT_WRONG = "ves-event-wrong-data"

export const GET = "GET";
export const POST = "POST";
export const NEG_POST = "NEG_POST";

