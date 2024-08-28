import { APIEndpoint } from './APIEndpoint.js';
import { ADCApi } from './ADCApi.js';
import * as Constants from './Constants.js';
export class ObjectBuilder{

   constructor(){
    //  this.adcApi=new ADCApi("http://host.docker.internal:80/");
    //  this.adcApi=new ADCApi("http://ves.adc-new.hall923.rnd.gic.ericsson.se/");
    this.adcApi=new ADCApi(`${__ENV.hostname_url}`);
   }
   createObject(verb){

    if(Constants.GET==verb){
       return this.createGETObject();
    }
    if(Constants.POST==verb){
      return this.createPOSTObject();
    }
    if(Constants.NEG_POST==verb){
      return this.createNegPOSTObject();
    }

    return this.adcApi;
  }
  createGETObject(){
    this.createEndpoint("",Constants.GET,null);
    return this.adcApi;
  }
  createPOSTObject(){
    this.createEndpoint(Constants.VES_EVENT_URI,Constants.POST,Constants.VES_EVENT);
    this.createEndpoint(Constants.VES_EVENT_BATCH_URI,Constants.POST,Constants.VES_EVENT_BATCH);
    return this.adcApi;
  }
  createNegPOSTObject(){
    this.createEndpoint(Constants.VES_EVENT_URI,Constants.NEG_POST,Constants.VES_EVENT_NEG);
    this.createEndpoint(Constants.VES_EVENT_BATCH_URI,Constants.NEG_POST,Constants.VES_EVENT_BATCH_NEG);
    return this.adcApi;
  }
  createEndpoint(uri,verb,dataInputName){
    let endpoint=null;
    if(dataInputName==null){
    endpoint=new APIEndpoint(uri,verb,null);
    }else{
    var jsonData = JSON.parse(open("./Adc-Json/"+dataInputName+".json"));
    endpoint=new APIEndpoint(uri,verb,JSON.stringify(jsonData));
    }
    this.adcApi.addEndpoint(endpoint);
  }
}