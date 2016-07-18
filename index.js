document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    var ipfs = window.IpfsApi();

    let editHash = '/ipfs/QmeX3PvkUNa5YSBFFByePEbcXX7R523HNLuhANBMWMyroL';
    const ipnsHash = 'QmNektv2ExBqgyoD6QcSH6M8B7PPDrjEVGjmSvQq9HV1Hf';

    const info = {
      editHash: editHash,
      link: 'https://ipfs.io' + editHash
    };
    let json = { "info": info };
    let jsonResponse;

    document.getElementById('store').onclick = update;
    document.getElementById('default').onclick = defaultData;
    getHash();

    ipfs.id()
  .then(function (id) {
    console.log('my id is: ', id)
  })
  .catch(function(err) {
    console.log('Fail: ', err)
  })

    function defaultData() {
      document.getElementById('source').innerText = JSON.stringify(json);
    }

    function getHash() {
      console.log('getHash');
      ipfs.name.resolve(ipnsHash, (err, res) => {
        let hash = res.Path.substr(res.Path.lastIndexOf('/') + 1, res.Path.length);
        console.log('ipfs.name.resolve', hash);
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
            console.log('Please edit from here: ', json.info.link);
            document.getElementById('source').innerText = res;
          })
        }
      });
    }

    function update() {
      console.log('update');
      let json = document.getElementById('source').value;
      // let buffer = new Buffer(JSON.stringify(json));
      let buffer = new Buffer(json);

      ipfs.add(buffer, function (err, res) {
        if (err || !res) return console.error("ipfs add error", err, res);
        let file = res[0];
        console.log('ipfs.add', file);

        ipfs.name.publish(file.path, (err, res) => {
          console.log('ipfs.name.publish', res);

          display(res.Value);
        });
      });
    }
  }
};
