const pg = require('pg');
const express = require('express');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_notes_db');
const app = express();

// static routes here (you only need these for deployment)

// parse the body into JS Objects
app.use(express.json());

// Log the requests as they com in
app.use(require('morgan')('dev'));

// Create Notes -C
app.post('/api/notes', async (req, res, next) => {
  try {
    const SQL = /*sql*/
    `
    INSERT INTO notes(txt)
    VALUES($1)
    RETURNING *
    `;
    const response = await client.query(SQL, [req.body.txt]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

// Read Notes - R
app.get('/api/notes', async (req, res, next) => {
  try {
    const SQL = /*sql*/
    `
    SELECT * from notes ORDER BY created_at DESC;
    `;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (ex) {
    next(ex);
  };
});

// Updates Notes - U
app.put('/api/notes/:id', async (req, res, next) => {
  try {
    const SQL = /*sql*/
    `
    UPDATE notes 
    SET txt=$1, ranking=$2, updated_at= now()
    WHERE id=$3 RETURNING *
    `;
    const response = await client.query(SQL, [req.body.txt, req.body.ranking, req.params.id]);
    res.send(response.rows[0]);
  } catch (ex) {
    next(ex);
  }
});

// Delete Notes - D
app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const SQL = /*sql*/
    `
    DELETE from notes
    WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

// create your init function (create and run the express app)
const init =  async () => {
  await client.connect();
  console.log('connected to database');
  let SQL = /*sql*/
  `
  DROP TABLE IF EXISTS notes;
  CREATE TABLE notes(
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  ranking INTEGER DEFAULT 3 NOT NULL,
  txt VARCHAR(255) NOT NULL
  );
  `;
  await client.query(SQL);
  console.log('tables created');
  SQL = /*sql*/
  `
  INSERT INTO notes(txt, ranking) VALUES('learn express', 5);
  INSERT INTO notes(txt, ranking) VALUES('write SQL queries', 4);
  INSERT INTO notes(txt, ranking) VALUES('create routes', 2);
  `;
  await client.query(SQL);
  console.log('data seeded');
  const serverPort = process.env.PORT || 3000;
  app.listen(serverPort, () => console.log(`Listening on port ${serverPort}`));
};

// init function invocation
init();
