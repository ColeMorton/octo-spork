const app = new App();

app.init();

function App() {
  const sync = new Sync();

  var ipfs = window.IpfsApi();

  let editHash;
  const ipnsHash = 'QmNektv2ExBqgyoD6QcSH6M8B7PPDrjEVGjmSvQq9HV1Hf';
  let appInfo;

  return {
    init: init,
    defaultData: defaultData,
    getHash: getHash,
    display: display,
    update: update
  };

  function init() {
      document.onreadystatechange = () => {
      if (document.readyState === 'complete') {
        document.getElementById('store').onclick = update;
        document.getElementById('default').onclick = defaultData;
      }
    };

    if (!isLocal()) {
      setAppInfo();
    }
    getHash();

    function setAppInfo() {
      appInfo = {
        appHash: getCurrentHash(),
        appLink: 'https://ipfs.io/ipfs/' + getCurrentHash(),
        timestamp: Date.now()
      };
    }
  }

  function isLocal() {
    return getCurrentHash() === false;
  }

  function getCurrentHash() {
    let path = window.location.pathname;
    let startsWith = '/ipfs/';
    if (path.indexOf(startsWith) !== -1) {
      path = path.substr(startsWith.length);
      return path.substr(0, path.length - 1);
    }
    return false;
  }

  function defaultData() {
    document.getElementById('source').innerText = JSON.stringify({ appInfo: [], items: [] });
  }

  function getHash() {
    console.log('getHash');
    ipfs.name.resolve(ipnsHash, (err, res) => {
      let hash = res.Path.substr(res.Path.lastIndexOf('/') + 1);
      console.log('ipfs.name.resolve', hash);

      // if (!isLocal()) {
      //   appInfo.dataHash = hash;
      //   appInfo.dataLink = 'https://ipfs.io/ipfs/' + hash;

      //   db.get('appInfo')
      //     .push(appInfo)
      //     .value();
      // }

      document.getElementById('hash').innerText = hash;
      display(hash);
    });
  }

  function display(hash) {
    console.log('display');
    
    ipfs.cat(hash, function (err, stream) {
      if (err || !stream) return console.error("ipfs cat error", err, stream);
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
          console.log('ipfs cat', res);

          if (json.info) {
            console.log('Please edit from here: ', json.info.link);
          }

          document.getElementById('source').innerText = res;
          sync.set(json);
          sync.render();
        })
      }
    });
  }

  function update() {
    console.log('update');
    let json = document.getElementById('source').value;
    let buffer = new Buffer(json);

    ipfs.add(buffer, function (err, res) {
      if (err || !res) return console.error("ipfs add error", err, res);
      let file = res[0];
      console.log('ipfs.add', file);

      ipfs.name.publish(file.path, (err, res) => {
        console.log('ipfs.name.publish', res);

        console.log(x);

        display(res.Value);
      });
    });
  }
}

function Sync() {
  const db = low('db')
  db.setState({});

  var _ = require('underscore');
  var _db = require('underscore-db');
  _.mixin(_db);
  db._.mixin();

  db.defaults({ appInfo: [], items: [] }).value();

  return {
    set: set,
    render: render
  };

  function set(json) {
    db.setState(json);
  }

  function render() {
    const state = db.getState()
    const str = JSON.stringify(state, null, 2)
    console.log('render', str);
  }
}