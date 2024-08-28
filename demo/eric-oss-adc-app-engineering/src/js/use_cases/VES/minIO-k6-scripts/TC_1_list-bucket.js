import http from 'k6/http';
import { check } from 'k6';
import aws4 from './aws4.js';

export let options = {
  vus: 1,
  duration: '1s',
};

const MINIO_CREDS = {
  accessKeyId: 'minio-user',
  secretAccessKey:'Ericsson123!',
};

export default function () {
  const signed = aws4.sign(
    {
      service: 's3',
      hostname:'eric-data-object-storage-mn:9000',
      region: 'us-east-1',
      expires: 60
    },
    MINIO_CREDS
  );

  let res = http.get(`http://${signed.hostname}`, {
    headers: signed.headers
  });

  check(res, {
    'status is 200': (r) => r.status === 200
  });

  console.log(res.body);
}
