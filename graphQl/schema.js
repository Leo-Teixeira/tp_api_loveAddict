import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

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

  type Query {
    getUser(id: ID!): User
  }

  type Ville {
    idVille: Int!
    nom: String
    coordonnees: String
  }

  type Query {
    getVille(id: ID!): Ville
  }

  type Style {
    idStyle: Int!
    libelle: String
    description: String
  }

  type Query {
    getStyle(id: ID!): Style
  }

  type Realise {
    IdArtiste: Int!
    idConcert: Int!
  }

  type Query {
    getRealise(id: ID!): Realise
  }

  type Participe {
    idConcert: Int!
    idVisiteur: Int!
  }

  type Query {
    getParticipe(id: ID!): Participe
  }

  type Joue {
    idConcert: Int!
    idStyle: Int!
  }

  type Query {
    getJoue(id: ID!): Joue
  }

  type Concert {
    idConcert: Int!
    dateConcert: Date
    nbrPlaceDisponible: Int
    idVille: Int!
  }

  type Query {
    getConcert(id: ID!): Concert
  }

  type Artiste {
    IdArtiste: Int!
    pseudo: String
    idStyle: Int
  }

  type Query {
    getArtiste(id: ID!): Artiste
  }
`);
