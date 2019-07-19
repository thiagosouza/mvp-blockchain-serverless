'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

const cors = require('cors')

console.log(process.env.NODE_ENV);

if (process.env.NODE_ENV === "production") {
    admin.initializeApp();
}
else {
    var serviceAccount = require("../.mvp-blockchain-serverless-firebase-adminsdk-bmjq1-3668c4faeb.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://mvp-blockchain-serverless.firebaseio.com"
    });
}

var db = admin.database();
const express = require('express');
const app = express();

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = async (req, res, next) => {
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.status(403).send('Unauthorized');
        return;
    }
    const idToken = req.headers.authorization.split('Bearer ')[1];
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        // console.log(decodedIdToken);
        req.user = decodedIdToken;
        next();
        return;
    } catch (e) {
        res.status(403).send('Unauthorized');
        return;
    }
};

// var whitelist = ["https://paradigma.education", "http://localhost"];
// var corsOptions = { origin: (origin, callback) => (whitelist.indexOf(origin) !== -1 || !origin) ? callback(null, true) : callback(new Error('Not allowed by CORS')) }
// app.use(cors(corsOptions));

app.use(cors());

app.use(authenticate);

// var user = {
//     name: 'Thiago Souza',
//     picture: 'https://lh4.googleusercontent.com/-VdKZ1Kor6ek/AAAAAAAAAAI/AAAAAAADU98/JZfhKFQ8hfI/photo.jpg',
//     premium: true,
//     iss: 'https://securetoken.google.com/paradigma-dev-firebase',
//     aud: 'paradigma-dev-firebase',
//     auth_time: 1558646048,
//     user_id: 'MqF0E6XFGeh9HDfQJ9CazvBZmfM2',
//     sub: 'MqF0E6XFGeh9HDfQJ9CazvBZmfM2',
//     iat: 1558646048,
//     exp: 1558649648,
//     email: 'thiago.souzapassos@gmail.com',
//     email_verified: true,
//     firebase: {
//         identities: { 'google.com': [Array], email: [Array] },
//         sign_in_provider: 'google.com'
//     },
//     uid: 'MqF0E6XFGeh9HDfQJ9CazvBZmfM2'
// }




app.get('/users/:uid', async (req, res) => {

    const { uid } = req.params;

    try {
        var postGet = await admin.firestore().doc(`/users/${uid}`).get();
        if (!postGet.exists) res.set('Cache-Control', 'private, max-age=300').status(404).json({ errorCode: 404, errorMessage: `user '${uid}' not found` });
    } catch (error) {
        console.log('Error getting user details', uid, error.message);
        return res.sendStatus(500);
    }

    return res.status(200).json(postGet.data());
});


// Expose the API as a function
exports.api = functions.https.onRequest(app);

var runtimeOpts = {
    timeoutSeconds: 120, /* 1-540 (9 minutes) */
    memory: '256MB' /* 128MB 256MB 512MB 1GB 2GB */
};

