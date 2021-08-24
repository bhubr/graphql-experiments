const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  type Mutation {
    setMessage(message: String): String
  }

  type Query {
    getMessage: String
    getDie(numSides: Int): RandomDie
  }
`);

class RandomDie {
  constructor(numSides) {
    this.numSides = numSides;
  }

  rollOnce() {
    return 1 + Math.floor(Math.random() * this.numSides);
  }

  roll({ numRolls }) {
    const out = [];
    for (let i = 0; i < numRolls; i += 1) {
      out.push(this.rollOnce());
    }
    return out;
  }
}

const fakeDb = {
  message: 'N/A'
};

const root = {
  getDie: ({ numSides }) => new RandomDie(numSides || 6),
  setMessage: ({ message }) => {
    fakeDb.message = message;
    return message;
  },
  getMessage: () => fakeDb.message,
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
