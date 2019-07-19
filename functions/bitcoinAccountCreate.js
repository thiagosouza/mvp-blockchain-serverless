const admin = require('firebase-admin');
const bitcoin = require('bitcoinjs-lib');

exports.bitcoinAccountCreate = async function bitcoinAccountCreate(change, context) {

	let data = change.after.data();

	if ("bitcoin" in data) {
		return Promise.reject(new Error("Already has a bitcoin account"));
	}

	try {
		var keyPair = bitcoin.ECPair.makeRandom();
		var { address } = bitcoin.payments.p2pkh({ "pubkey": keyPair.publicKey })

		console.info("keyPair", keyPair);
		console.info("address", address);
	} catch (error) {
		console.log("catch");
		return change.after.ref.collection('/errors/').add(Object.assign({}, { error: error }));
	}

	await change.after.ref.update({ "bitcoin": { "address": address } });

	return true;
}