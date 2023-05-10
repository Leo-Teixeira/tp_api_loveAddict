import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import mariadb from "mariadb";

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "rootpwd",
  database: "liveAddict",
  port: 4000,
});

const schema = buildSchema(`
  type Visiteur {
    idVisiteur: Int!
    nom: String
    prenom: String
    email: String
    age: Int
    adresse: String
    idParrain: Int
    idVille: Int
  }

  type Ville {
    idVille: Int!
    nom: String
    coordonnees: String
  }

  type Style {
    idStyle: Int!
    libelle: String
    description: String
  }

  type Realise {
    IdArtiste: Int!
    idConcert: Int!
  }

  type Participe {
    idConcert: Int!
    idVisiteur: Int!
  }

  type Joue {
    idConcert: Int!
    idStyle: Int!
  }

  type Concert {
    idConcert: Int!
    dateConcert: String
    nbrPlaceDisponible: Int
    idVille: Int!
  }

  type Artiste {
    IdArtiste: Int!
    pseudo: String
    idStyle: Int
  }

  type Query {
    getArtistes: [Artiste], 
    getConcerts: [Concert],
    getStyles: [Style],
    getVilles: [Ville],
    getVisiteurs: [Visiteur],
  }
`);

const root = {
  getArtistes: async () => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query("SELECT * FROM Artiste");
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  },

  getConcerts: async () => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query("SELECT * FROM Concert");
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  },

  getStyles: async () => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query("SELECT * FROM Style");
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  },

  getVilles: async () => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query("SELECT * FROM Ville");
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  },

  getVisiteurs: async () => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query("SELECT * FROM Visiteur");
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }
  },
};

/* This code is setting up a GraphQL API server using the Express framework in JavaScript. */
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(3000);
console.log("Running a GraphQL API server at http://localhost:3000/graphql");
