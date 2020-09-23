const admin = require('firebase-admin');
//TODO: add admin sdk configuration
const serviceAccount = require('./firebase-adminsdk.json');

//TODO: replace <Firebase-Project-Id>
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.GCP_STORAGE || 'staging.<Firebase-Project-Id>.appspot.com',
  });
  console.info('<Project-Name> Server | Firebase | Admin Application Initialized');
} catch (e) {
  console.error(new Error('<Project-Name> Server | Firebase | Could not initialize admin application'), e);
  return;
}

const auth = admin.auth();
const bucket = admin.storage().bucket();
module.exports = { auth, bucket };
