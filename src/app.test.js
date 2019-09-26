const assert = require('assert').strict;
const supertest = require('supertest');

const app = require('./app');

describe('GET /', () => {
  it('1', async () => {
    const url = 'https://podcastify.hiogawa.now.sh/enclosure?videoUrl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DIPS8jTWya8Y';
    await supertest(app)
      .get('/')
      .query({ url })
      .expect(res => {
        assert.strictEqual(res.status, 200);
      })
  });
});

describe('HEAD /', () => {
  it('1', async () => {
    const url = 'https://podcastify.hiogawa.now.sh/enclosure?videoUrl=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DIPS8jTWya8Y';
    await supertest(app)
      .head('/')
      .query({ url })
      .expect(res => {
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.text, undefined);
        console.log(res.header)
      })
  });
});
