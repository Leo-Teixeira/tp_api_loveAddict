import express from "express";
import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "graphql";

/* `var schema = buildSchema(`
  type Query {
    hello: String
  }
`);` is defining the schema for the GraphQL API. It is using the `buildSchema` function from the
`graphql` library to create a GraphQL schema object. The schema defines the available types and
fields for the API, in this case, it defines a `Query` type with a single field `hello` that returns
a string. */
var schema = buildSchema(`
  type Query {
    hello: String
  }
`);

/* `var root` is an object that provides a resolver function for the `hello` API endpoint. The resolver
function returns the string "Hello world!" when the `hello` query is executed. */
var root = {
  hello: () => {
    return "Hello world!";
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
