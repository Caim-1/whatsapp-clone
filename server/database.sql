CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  username VARCHAR(28) NOT NULL UNIQUE,
  passhash VARCHAR NOT NULL,
  userid VARCHAR NOT NULL UNIQUE,
  connected BOOLEAN NOT NULL
);

CREATE TABLE friends (
  id SERIAL PRIMARY KEY,
  username VARCHAR(28) NOT NULL,
  friendUsername VARCHAR(28) NOT NULL
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  msgFrom VARCHAR(50) NOT NULL,
  msgTo VARCHAR(50) NOT NULL,
  msgContent VARCHAR(256) NOT NULL
);

INSERT INTO users(username, passhash) values($1, $2);