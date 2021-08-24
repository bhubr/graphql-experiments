const express = require('express');
const crypto = require('crypto');
const { graphqlHTTP } = require('express-graphql');
const { graphql, buildSchema } = require('graphql');

const schema = buildSchema(`
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    roll(numRolls: Int!): [Int]
  }

  input MessageInput {
    content: String
    author: String
  }

  type Message {
    id: String
    content: String
    author: String
  }

  type Mutation {
    createMessage(input: MessageInput): Message
    updateMessage(id: ID!, input: MessageInput): Message
  }

  type Query {
    getAllMessages: [Message]
    getMessage(id: ID!): Message
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

class Message {
  constructor(id, { content, author }) {
    this.id = id;
    this.content = content;
    this.author = author;
  }
}

const fakeDb = {};

const root = {

  getDie: ({ numSides }) => new RandomDie(numSides || 6),

  getAllMessages: () => Object.values(fakeDb),

  createMessage: ({ input }) => {
    const id = crypto.randomBytes(10).toString('hex');
    fakeDb[id] = { id, ...input };
    return new Message(id, input);
  },

  updateMessage: ({ id, input }) => {
    if (!fakeDb[id]) {
      throw new Error(`No message with id ${id}`);
    }
    fakeDb[id] = { id, ...input };
    return new Message(id, input);
  },

  getMessage: ({ id }) => {
    if (!fakeDb[id]) {
      throw new Error(`No message with id ${id}`);
    }
    return fakeDb[id];
  },
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
