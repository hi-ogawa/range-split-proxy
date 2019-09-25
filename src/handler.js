const fetch = require('node-fetch');
const lib = require('./lib.js');

const handler = async (req, res) => {
  let { url, chunk } = req.query
  if (!url) {
    return res.status(400).send('Required parameter: url');
  }
  let start, end, total;
  chunk = (chunk && Number(chunk)) || 2**22; // default 4MiB

  // 0. Check if start range is given in original request
  {
    const m = req.headers['range'] && req.headers['range'].match(/range: bytes=(\d*)-(\d*)/);
    start = (m && m[1] && Number(m[1])) || 0;
    end = (m && m[2] && Number(m[2]));
  }

  // 1. Obtail whole range size (and check if range request is supported)
  const emptyResp = await fetch(url, { headers: { range: 'bytes=0-0' } });
  {
    if (!emptyResp.ok) {
      return res.status(400).send('Invalid url');
    }
    if (!emptyResp.headers.get('content-range')) {
      return res.status(400).send('Range request is not supported');
    }
    const m = emptyResp.headers.get('content-range').match(/bytes 0-0\/(.*)/);
    total = m && m[1] && Number(m[1]);
    end = end || (total - 1);
    if (start > end) {
      return res.status(400).send('Invalid range selection');
    }
  }

  // 2. Write resposne header
  {
    const respHeaders = Object.assign({
      'content-range': `bytes ${start}-${end}/${total}`,
      'content-length': (end - start) + 1
    }, emptyResp.headers);
    res.writeHead(200, respHeaders);
  }

  // 3. Compute how to split
  const ranges = [];
  {
    let i = start;
    while (true) {
      let chunkStart = i;
      if (chunkStart + chunk > end) {
        ranges.push([chunkStart, end]);
        break;
      }
      ranges.push([chunkStart, chunkStart + chunk - 1])
      i = i + chunk;
    }
  }

  // 4. Sequentially request each splitted range and write to the response body
  const executions = ranges.map(([chunkStart, chunkEnd]) => async () => {
    debugger;
    console.log('CHUNK REQUEST: ', [chunkStart, chunkEnd], url);
    const chunkResp = await fetch(url, { headers: { range: `bytes=${chunkStart}-${chunkEnd}` } });
    const buffer = await chunkResp.buffer();
    await lib.writeStream(res, buffer);
  });
  await lib.sequentialAll(executions);
};

module.exports = handler;
