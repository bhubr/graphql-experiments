const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
  type Query {
    hello: String
  }
`);

const root = {
  hello: () => 'Hello World!'
};

const app = express();
app.use(express.static('public'));

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true
}));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`GraphQL server running on port ${port}`);
});
