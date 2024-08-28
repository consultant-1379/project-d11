import http from 'k6/http';
import { check } from 'k6';
import aws4 from './aws4.js';

const bucketName='/test2';
const objectName='/file.txt';

const MINIO_CREDS = {
  accessKeyId: 'minio-user',
  secretAccessKey:'Ericsson123!',
};

export default function () {
  const signed = aws4.sign(
    {
      service: 's3',
      hostname:'eric-data-object-storage-mn:9000',
      region:'us-east-1',
      expires: 60,
      path:bucketName+objectName,
       headers: {
        'Content-Type': 'multipart/form-data',
        'X-Amz-Content-Sha256':'STREAMING-AWS4-HMAC-SHA256-PAYLOAD'
      }
    },
    MINIO_CREDS
  );

  let res = http.get(`http://${signed.hostname}${signed.path}`,
  signed.body,
 
  {
    headers: signed.headers
  }
  );
  
  check(res, {
    'status is 200': (r) => r.status === 200
  });

  console.log(res.body,'Status code: ',res.status_text);
  console.log(Object.entries(res.headers));
  console.log('-----------------------------------');
  console.log(JSON.stringify(res.headers));
  console.log(JSON.stringify('----:',res.objectName));
}


