const Config = require('./config.js');
const Ipfs = require('./ipfs.js');

const db = low('db');
db.setState({});

var _ = require('underscore');
var _db = require('underscore-db');
_.mixin(_db);
db._.mixin();

db.defaults({ appInfo: [], items: [{ 'name': 'cole' }] }).value();

const ipfs = new Ipfs();
const config = new Config();

function getState() {
  return new Promise((resolve, reject) => {
    if (config.isLocal) {
      ipfs.getIpfsHash().then(ipfs.getIpfsData).then(onStateRecieved);
    } else {
      ipfs.getIpnsData().then(onStateRecieved);
    }

    function onStateRecieved(state) {
      db.setState(state);
      resolve(db.getState());
    }
  });
}

function add(tableName, entry) {
  return new Promise((resolve, reject) => {
    db.get(tableName)
      .push(entry)
      .value();

    ipfs.set(db.getState()).then(() => {
      resolve(db.getState());
    });
  });
}

function removeAll(tableName) {
  return new Promise((resolve, reject) => {
    let state = db.getState();
    state[tableName] = [];
    db.setState(state);

    ipfs.set(db.getState()).then(() => {
      resolve(db.getState());
    });
  });
}

module.exports = {
  getState: getState,
  add: add,
  removeAll: removeAll
};