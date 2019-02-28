const admin = require('firebase-admin');

const { Accounts } = require('web3-eth-accounts') //Web3js 1.0 dependencies
const accounts = new Accounts('https://kovan.infura.io/v3/f1be797452774133a11f7688f5316a47');

const path = require('path');

const bucket = admin.storage().bucket('gs://mvp-blockchain-serverless');

exports.ethereumAccountCreate = async function ethereumAccountCreate(snap, context) {

	const pass = "12345678";

	try {
		var accCreated = accounts.create();
		var accEncrypted = accounts.encrypt(accCreated.privateKey, pass);

		if (!accEncrypted)
			console.error(new Error("Error while encrypting account"));

	} catch (error) {
		console.error(new Error("Error while creating account", error));
	}

	let fileData = JSON.stringify(accEncrypted);
	let fileName = `${context.params.uid}.json`;
	let bucketfilePath = path.join(`/users/${context.params.uid}/ethereum/`, fileName);

	let file = bucket.file(bucketfilePath);
	await file.save(fileData, { contentType: "application/json" });
	await snap.ref.update({
		"ethereum": {
			"address": accCreated.address,
			"privateKey": accCreated.privateKey,
			"walletFile": accEncrypted
		}
	});

	return true;
}