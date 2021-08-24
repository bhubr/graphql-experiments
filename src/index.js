const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
  type Query {
    quoteOfTheDay: String
    random: Float
    rollDice(numDice: Int!, numSides: Int): [Int]
  }
`);

const root = {
  quoteOfTheDay: () => Math.random() < 0.5 ? 'Take it easy' : 'Salvation lies within',
  random: () => Math.random(),
  rollDice: ({ numDice, numSides }) => console.log(({ numDice, numSides }) )||new Array(numDice || 0).fill(0).map(_ => 1 + Math.floor(Math.random() * (numSides || 6)))
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
