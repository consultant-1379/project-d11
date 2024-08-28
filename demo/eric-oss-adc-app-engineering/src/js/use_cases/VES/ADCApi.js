import { APIEndpoint } from './APIEndpoint.js'
export class ADCApi{

   constructor(baseUrl){
      this.baseUrl=baseUrl;
      this.endpoints=[];
   }

    addEndpoint(endpoint){
     endpoint.setBaseUrl(this.baseUrl);
     this.endpoints.push(endpoint);
   }
    getAllEndpoints(){
     return endpoints;
   }
    getEndpointsByVerb(verb){
        var verbEndpoints=[]
        for(let i=0; i< this.endpoints.length;i++ ){
           if( verb==this.endpoints[i].getVerb()) {
            if( verb=="NEG_POST") {
               this.endpoints[i].setVerb("POST")
            }
              verbEndpoints.push(this.endpoints[i].getRequest());
           }
        }
        console.log(verbEndpoints);
        return verbEndpoints;
      }
}