const $ = require('jquery');
const Config = require('./config.js');

module.exports = function Sync() {
  const ipfs = window.IpfsApi();
  const ipnsHash = 'QmNektv2ExBqgyoD6QcSH6M8B7PPDrjEVGjmSvQq9HV1Hf';
  const ipnsGateway = 'https://gateway.ipfs.io/ipns/' + ipnsHash;
  let ipfsHash;
  let config = new Config();

  return {
    getIpnsData: getIpnsData,
    getIpfsHash: getIpfsHash,
    getIpfsData: getIpfsData,
    set: set
  };

  function getIpnsData() {
    console.log('getIpnsData');
    return new Promise((resolve, reject) => {
      $.get(ipnsGateway, onDataReceived);

      function onDataReceived(data) {
        console.log('$.get', data);
        let json = JSON.parse(data);
        resolve(json);
      }
    });
  }

  function getIpfsHash() {
    console.log('getIpfsHash');
    return ipfs.name.resolve(ipnsHash).then((res) => {
      console.log('ipfs.name.resolve', res);
      return res.Path.substr(res.Path.lastIndexOf('/') + 1);
    });
  }

  function getIpfsData(hash) {
    console.log('getIpfsData');
    return ipfs.cat(hash).then((stream) => {
      console.log('ipfs.cat', stream);
      var promise = new Promise((resolve, reject) => {
        var res = '';

        if (!stream.readable) {
          console.error('unhandled: cat result is a pipe', stream);
        } else {
          stream.on('data', function (chunk) {
            res += chunk.toString();
          });

          stream.on('error', function (err) {
            console.error('Oh nooo', err);
          });

          stream.on('end', function () {
            let json = JSON.parse(res);
            console.log('sync.getData success', json);
            resolve(json);
          });
        }
      });
      return promise;
    });
  }

  function set(state) {
    console.log('set', state);
    let buffer = new Buffer(JSON.stringify(state));

    return new Promise((resolve, reject) => {
      ipfs.add(buffer, (err, res) => {
        if (err || !res) return console.error("ipfs add error", err, res);
        console.log('ipfs.add', res);
        let file = res[0];

        ipfs.name.publish(file.path, (err, res) => {
          console.log('ipfs.name.publish', res);
          resolve();
        });
      });
    });
  }
}