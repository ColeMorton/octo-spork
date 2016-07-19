module.exports = function Sync() {
  const ipfs = window.IpfsApi();
  const ipnsHash = 'QmNektv2ExBqgyoD6QcSH6M8B7PPDrjEVGjmSvQq9HV1Hf';

  const db = low('db')
  db.setState({});

  var _ = require('underscore');
  var _db = require('underscore-db');
  _.mixin(_db);
  db._.mixin();

  db.defaults({ appInfo: [], items: [] }).value();

  return {
    getDataHash: getDataHash,
    getData: getData,
    set: set,
    render: render
  };

  function getDataHash() {
    return ipfs.name.resolve(ipnsHash)
      .then((res) => {
        console.log('ipfs.name.resolve', res);
        return res.Path.substr(res.Path.lastIndexOf('/') + 1);
      });
  }

  function getData(hash) {
    return ipfs.cat(hash)
      .then((stream) => {
        console.log('ipfs.cat', stream);
        var promise = new Promise((resolve, reject) => {
          var res = '';

          if (!stream.readable) {
            console.error('unhandled: cat result is a pipe', stream);
          } else {
            stream.on('data', function (chunk) {
              res += chunk.toString();
            })

            stream.on('error', function (err) {
              console.error('Oh nooo', err);
            })

            stream.on('end', function () {
              let json = JSON.parse(res);
              console.log('sync.getData success', json);
              setState(json);
              resolve(json);
            })
          }
        });
        return promise;
      });
  }

  function set(string) {
    let buffer = new Buffer(string);

    ipfs.add(buffer, function (err, res) {
      if (err || !res) return console.error("ipfs add error", err, res);
      let file = res[0];
      console.log('ipfs.add', file);

      ipfs.name.publish(file.path, (err, res) => {
        console.log('ipfs.name.publish', res);
      });
    });
  }

  function setState(json) {
    db.setState(json);
  }

  function render() {
    const state = db.getState()
    const str = JSON.stringify(state, null, 2)
    console.log('render', str);
  }
}