// const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const Storage = require('@google-cloud/storage');
// const db = admin.firestore();

//Web3js 1.0 dependencies
const { Accounts } = require('web3-eth-accounts')
const accounts = new Accounts('https://kovan.infura.io/v3/f1be797452774133a11f7688f5316a47');

const fs = require('fs');
const path = require('path');

// var bucket = admin.storage().bucket('gs://mvp-blockchain-serverless');

exports.ethereumAccountCreate = async function ethereumAccountCreate(change, context) {

	const pass = "12345678";

	let data = change.after.data();

	if (data.ethereum) {
		return Promise.reject(new Error("Already has an ethereum account"));
	}

	try {
		var accCreated = accounts.create();
		var accEncrypted = accounts.encrypt(accCreated.privateKey, pass);

		if (!accEncrypted)
			console.error(new Error("Erro ao encryptar account"));

	} catch (error) {
		console.log("catch");
		return change.after.ref.collection('/errors/').add(Object.assign({}, { error: error }));
	}

	// const fileData = JSON.stringify(accEncrypted);
	// const fileName = context.params.uid + '.json';
	// const bucketfilePath = path.join(`/users/${context.params.uid}/ethereum/`, fileName);

	// let file = bucket.file(bucketfilePath);
	// await file.save(fileData, { contentType: "application/json" });
	await change.ref.update({ "ethereum": { "address": accCreated.address, "privateKey": accCreated.privateKey, walletFile: accEncrypted } });

	return true;
}