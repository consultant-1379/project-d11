export class APIEndpoint{
   constructor(endpointUrl,verb, data){
       this.data=data;
       this.endpointUrl_=endpointUrl;
       this.verb=verb;
   }
    getVerb(){
      return this.verb;
   }
    setBaseUrl(baseUrl){
     this.baseUrl=baseUrl;
   }

   setVerb(verb){
    this.verb=verb;
  }
    getBaseUrl(){
     return this.baseUrl;
   }
    getHeader(){
     console.log("this.header value :"+ this.header)
     //if (this.header!=null)
     //   return this.header;
     return {headers: {'Content-Type': 'application/json',
                        'X-MinorVersion': '2'
                        }};
   }
    getRequest(){
    //console.log("headers :"+ this.getHeader().headers)
    if(this.data==null)
        return [this.getVerb(),this.getBaseUrl()+this.endpointUrl_,this.getHeader()]
    else
        return [this.getVerb(),this.getBaseUrl()+this.endpointUrl_,this.data,this.getHeader()]
   }

}