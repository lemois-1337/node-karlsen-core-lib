'use strict';


const secp256k1 = require('secp256k1-wasm');
const blake2b = require('blake2b-wasm');

var karlsencore = module.exports;

karlsencore.secp256k1 = secp256k1;

// module information
karlsencore.version = 'v' + require('./package.json').version;
karlsencore.versionGuard = function(version) {
	if (version !== undefined) {
		var message = 'More than one instance of karlsencore-lib found. ' +
			'Please make sure to require karlsencore-lib and check that submodules do' +
			' not also include their own karlsencore-lib dependency.';
		throw new Error(message);
	}
};
karlsencore.versionGuard(global._karlsencoreLibVersion);
global._karlsencoreLibVersion = karlsencore.version;


const wasmModulesLoadStatus = new Map();
karlsencore.wasmModulesLoadStatus = wasmModulesLoadStatus;
wasmModulesLoadStatus.set("blake2b", false);
wasmModulesLoadStatus.set("secp256k1", false);

const setWasmLoadStatus = (mod, loaded) => {
	//console.log("setWasmLoadStatus:", mod, loaded)
	wasmModulesLoadStatus.set(mod, loaded);
	let allLoaded = true;
	wasmModulesLoadStatus.forEach((loaded, mod) => {
		//console.log("wasmModulesLoadStatus:", mod, loaded)
		if (!loaded)
			allLoaded = false;
	})

	if (allLoaded)
		karlsencore.ready();
}


blake2b.ready(() => {
	setWasmLoadStatus("blake2b", true);
})

secp256k1.onRuntimeInitialized = () => {
	//console.log("onRuntimeInitialized")
	setTimeout(() => {
		setWasmLoadStatus("secp256k1", true);
	}, 1);
}

secp256k1.onAbort = (error) => {
	console.log("secp256k1:onAbort:", error)
}
const deferred = ()=>{
	let methods = {};
	let promise = new Promise((resolve, reject)=>{
		methods = {resolve, reject};
	})
	Object.assign(promise, methods);
	return promise;
}
const readySignal = deferred();

karlsencore.ready = ()=>{
	readySignal.resolve(true);
}
karlsencore.initRuntime = ()=>{
	return readySignal;
}


// crypto
karlsencore.crypto = {};
karlsencore.crypto.BN = require('./lib/crypto/bn');
karlsencore.crypto.ECDSA = require('./lib/crypto/ecdsa');
karlsencore.crypto.Schnorr = require('./lib/crypto/schnorr');
karlsencore.crypto.Hash = require('./lib/crypto/hash');
karlsencore.crypto.Random = require('./lib/crypto/random');
karlsencore.crypto.Point = require('./lib/crypto/point');
karlsencore.crypto.Signature = require('./lib/crypto/signature');

// encoding
karlsencore.encoding = {};
karlsencore.encoding.Base58 = require('./lib/encoding/base58');
karlsencore.encoding.Base58Check = require('./lib/encoding/base58check');
karlsencore.encoding.BufferReader = require('./lib/encoding/bufferreader');
karlsencore.encoding.BufferWriter = require('./lib/encoding/bufferwriter');
karlsencore.encoding.Varint = require('./lib/encoding/varint');

// utilities
karlsencore.util = {};
karlsencore.util.buffer = require('./lib/util/buffer');
karlsencore.util.js = require('./lib/util/js');
karlsencore.util.preconditions = require('./lib/util/preconditions');
karlsencore.util.base32 = require('./lib/util/base32');
karlsencore.util.convertBits = require('./lib/util/convertBits');
karlsencore.setDebugLevel = (level)=>{
	karlsencore.util.js.debugLevel = level;
}

// errors thrown by the library
karlsencore.errors = require('./lib/errors');

// main bitcoin library
karlsencore.Address = require('./lib/address');
karlsencore.Block = require('./lib/block');
karlsencore.MerkleBlock = require('./lib/block/merkleblock');
karlsencore.BlockHeader = require('./lib/block/blockheader');
karlsencore.HDPrivateKey = require('./lib/hdprivatekey.js');
karlsencore.HDPublicKey = require('./lib/hdpublickey.js');
karlsencore.Networks = require('./lib/networks');
karlsencore.Opcode = require('./lib/opcode');
karlsencore.PrivateKey = require('./lib/privatekey');
karlsencore.PublicKey = require('./lib/publickey');
karlsencore.Script = require('./lib/script');
karlsencore.Transaction = require('./lib/transaction');
karlsencore.URI = require('./lib/uri');
karlsencore.Unit = require('./lib/unit');

// dependencies, subject to change
karlsencore.deps = {};
karlsencore.deps.bnjs = require('bn.js');
karlsencore.deps.bs58 = require('bs58');
karlsencore.deps.Buffer = Buffer;
karlsencore.deps.elliptic = require('elliptic');
karlsencore.deps._ = require('lodash');

// Internal usage, exposed for testing/advanced tweaking
karlsencore.Transaction.sighash = require('./lib/transaction/sighash');
