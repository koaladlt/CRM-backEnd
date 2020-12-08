const { gql } = require('apollo-server');

//Resolver

const typeDefs = gql`
type Query {
    obtenerCurso: String
}
`

module.exports = typeDefs;