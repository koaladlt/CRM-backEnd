const { ApolloServer, gql } = require("apollo-server")
const connectDb = require('./config/db')
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers')

//Connect to DB
connectDb();

//server

const server = new ApolloServer({
    typeDefs,
    resolvers
});


//start server

server.listen().then(({ url }) => {
    console.log(`Server ready on port ${url}`)
})