const path = require('path');
const fs = require('fs');
const { fastify } = require('fastify');
const fastifyStatic = require('fastify-static');
const Monk = require('monk');

const db = Monk('localhost/passcake');
const passwords = db.get('passwords');

passwords.createIndex('expiresAt', { expireAfterSeconds: 0 });

(async () => {
  const app = fastify({
    ignoreTrailingSlash: true,
    bodyLimit: 512 * 1024,
  });

  await app.register(fastifyStatic.default, {
    root: path.join(__dirname, 'static'),
  });

  app.get(
    '/password/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: { id: { type: 'string' } },
          required: ['id'],
        },
      },
    },
    async (req, res) => {
      const html = await fs.promises.readFile(path.join(__dirname, 'static/password.html'), 'utf8');
      const password = await passwords.findOne(req.params.id);
      if (password) {
        await res.type('text/html').send(html.replace('%data%', JSON.stringify(password)));
      } else {
        await res.send('Error 404 - this link is invalid or expired');
      }
    }
  );

  app.post(
    '/create-password',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            payload: { type: 'string' },
            counter: { type: 'integer' },
            expiresIn: { type: 'integer' },
          },
          required: ['payload', 'counter', 'expiresIn'],
        },
      },
    },
    async (req, res) => {
      const password = await passwords.insert({
        payload: req.body.payload,
        counter: req.body.counter,
        expiresAt: new Date(Date.now() + req.body.expiresIn),
      });
      res.send(password._id.toString());
    },
  );

  await app.listen(3000, '0.0.0.0');
})();
