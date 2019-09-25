// Use this to serialize multiple write to response body
// cf. https://nodejs.org/docs/latest/api/stream.html#stream_writable_write_chunk_encoding_callback
// @params  (WritableStream, Data)
// @returns Promise
const writeStream = (writable, data) =>
  new Promise(resolve =>
    writable.write(data) ? resolve() : writable.once('drain', resolve));

// [pf1, pf2, ...] --> Promise.resolve().then(pf1).then(pf2).then...
// @params  Array<() => Promise<()>>
// @returns Promise<()>
const sequentialAll = pfs =>
  pfs.reduce((p, pf) => p.then(pf), Promise.resolve())

module.exports = {
  writeStream, sequentialAll
};
