const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('./server');

test('GET /health returns service status', async () => {
  const response = await request(app).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'assignment-backend');
});

test('GET /api/items returns all items', async () => {
  const response = await request(app).get('/api/items');

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data));
});

test('POST /api/items creates a new item', async () => {
  const response = await request(app)
    .post('/api/items')
    .send({
      title: 'Security review',
      description: 'Run the final vulnerability check before release.',
      status: 'in_progress',
    });

  assert.equal(response.status, 201);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.title, 'Security review');
});
