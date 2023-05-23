import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";
import mariadb from "mariadb";
import { PrismaClient } from "@prisma/client";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { config } from "dotenv";
config();

const prisma = new PrismaClient();
const app = express();

/* `const pool = mariadb.createPool({...})` is creating a connection pool to a MariaDB database. The
`createPool` method takes an object with configuration options for the pool, including the host,
user, password, database, and port to connect to. The pool allows multiple connections to be
established to the database and reused as needed, improving performance and scalability of the
application. */
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "rootpwd",
  database: "liveAddict",
  port: 4000,
});

app.get("/auth/github", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    redirect_uri: process.env.CALLBACK_URL,
    scope: "user:email",
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;

  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code,
    redirect_uri: process.env.CALLBACK_URL,
  });

  try {
    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        body: params,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const data = await response.json();
    const accessToken = data.access_token;
    // Utilisez l'access token pour effectuer des requêtes API GitHub ou pour authentifier l'utilisateur.

    res.send("Connexion réussie avec GitHub !");
  } catch (error) {
    console.error("Erreur lors de l'obtention du token d'accès :", error);
    res.status(500).send("Erreur lors de la connexion avec GitHub.");
  }
});

/* `const schema = buildSchema(` ... `);` is defining the GraphQL schema for the API. It is specifying
the types of data that can be queried and the structure of those types. In this case, it defines
types for `Visiteur`, `Ville`, `Style`, `Realise`, `Participe`, `Joue`, `Concert`, `Artiste`, and a
`Query` type that includes functions to retrieve data for each of those types. The `buildSchema`
function is used to create a GraphQL schema object from the schema definition string. */
const schema = buildSchema(`
  type Visiteur {
    idVisiteur: Int!
    nom: String
    prenom: String
    email: String
    age: Int
    adresse: String
    idParrain: Int
    idVille: Ville
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

  type ProportionStyleVille {
    ville: String
    style: String
    proportion: Int
  }

  type Query {
    getArtistes: [Artiste], 
    getConcerts: [Concert],
    getStyles: [Style],
    getVilles: [Ville],
    getVisiteurs: [Visiteur],
    getProportionStylesByCity: [ProportionStyleVille],
    getVisiteurByVilles(villeId: Int!): [Visiteur]
  }
`);

// const root = {
//   /* This is a resolver function for the `getArtistes` query in the GraphQL schema. It is using the
// `pool` object from the `mariadb` library to establish a connection to a MySQL database and retrieve
// all rows from the `Artiste` table. The `async/await` syntax is used to handle asynchronous
// operations and the `try/catch/finally` block is used to handle errors and release the database
// connection after the query is executed. The function returns the result of the query, which will be
// an array of objects representing the rows in the `Artiste` table. */
//   getArtistes: async () => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const result = await conn.query("SELECT * FROM Artiste");
//       console.log(result);
//       return result;
//     } catch (err) {
//       throw err;
//     } finally {
//       if (conn) {
//         conn.release();
//       }
//     }
//   },

//   getConcerts: async () => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const result = await conn.query("SELECT * FROM Concert");
//       return result;
//     } catch (err) {
//       throw err;
//     } finally {
//       if (conn) {
//         conn.release();
//       }
//     }
//   },

//   getStyles: async () => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const result = await conn.query("SELECT * FROM Style");
//       return result;
//     } catch (err) {
//       throw err;
//     } finally {
//       if (conn) {
//         conn.release();
//       }
//     }
//   },

//   getVilles: async () => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const result = await conn.query("SELECT * FROM Ville");
//       return result;
//     } catch (err) {
//       throw err;
//     } finally {
//       if (conn) {
//         conn.release();
//       }
//     }
//   },

//   getVisiteurs: async () => {
//     let conn;
//     try {
//       conn = await pool.getConnection();
//       const result = await conn.query("SELECT * FROM Visiteur");
//       return result;
//     } catch (err) {
//       throw err;
//     } finally {
//       if (conn) {
//         conn.release();
//       }
//     }
//   },
// };

const root = {
  getArtistes: async () => {
    return prisma.artiste.findMany();
  },
  getConcerts: async () => {
    return prisma.concert.findMany();
  },
  getStyles: async () => {
    return prisma.style.findMany();
  },
  getVilles: async () => {
    return prisma.ville.findMany();
  },
  getVisiteurs: async () => {
    return prisma.visiteur.findMany();
  },

  getVisiteurByVilles: async ({ villeId }) => {
    const visiteurs = await prisma.visiteur.findUnique({
      where: { idVille: villeId },
      include: { ville: true },
    });

    return visiteurs;
  },

  getConcertByVilles: async () => {},

  getConcertByArtistes: async () => {},

  getProportionStylesByCity: async () => {
    let conn;
    try {
      conn = await pool.getConnection();
      const result = await conn.query(
        "SELECT v.nom AS ville, s.libelle AS style, COUNT(*) AS nombreEcoutes FROM Joue j INNER JOIN Concert c ON j.idConcert = c.idConcert INNER JOIN Ville v ON c.idVille = v.idVille INNER JOIN Style s ON j.idStyle = s.idStyle GROUP BY v.idVille, s.idStyle"
      );
      console.log(result);
      return result;
    } catch (err) {
      throw err;
    } finally {
      if (conn) {
        conn.release();
      }
    }

    return result;
  },
};

/* This code is setting up a GraphQL API server using the Express framework in JavaScript. */
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
