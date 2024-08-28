import http from 'k6/http';
import { check } from 'k6';
import aws4 from './aws4.js';

const bucketName='/test2';

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
      path:bucketName
    },
    MINIO_CREDS
  );
  let res = http.get(`http://${signed.hostname}${signed.path}`,{
    headers: signed.headers
  });
  
  check(res, {
    'status is 200': (r) => r.status === 200
  },res.body.toString);

  console.log(res.body,'--',res.status);
  
}
