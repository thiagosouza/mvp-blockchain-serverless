const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

const { ethereumAccountCreate } = require("./ethereumAccountCreate");

const runtimeOpts = { /* runtime options: https://firebase.google.com/docs/functions/manage-functions */
	timeoutSeconds: 120, /* 1-540 (9 minutes) */
	memory: '256MB' /* 128MB 256MB 512MB 1GB 2GB */
};

exports.ethereum = {
	accountCreate: functions.runWith(runtimeOpts).firestore.document('/users/{uid}')
		.onCreate((snap, context) => ethereumAccountCreate(snap, context))
}
