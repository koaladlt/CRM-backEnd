const { gql } = require('apollo-server');

//Resolver

const typeDefs = gql`


type User {
    id: ID
    name: String
    lastName: String
    email: String
    created: String
}

type Product {
    id: ID
    name: String
    stock: Int
    price: Float
    created: String
}

type Token {
    token: String
}

input UserInput {
    name: String!
    lastName: String!
    email: String!
    password: String!
}

input AuthenticateInput {
    email: String!
    password: String!
}

input ProductInput {
    name: String!
    stock: Int!
    price: Float!
}

type Query { 

    # User
    getUser (token: String!): User

    # Product

    getProducts: [Product]
    getProductById(id: ID!) : Product
}

type Mutation {

    # User
    newUser(input: UserInput) : User
    authenticateUser(input: AuthenticateInput) : Token

    #Product
    newProduct(input: ProductInput) : Product
    updateProduct(id: ID!, input: ProductInput) : Product
    deleteProduct(id:ID!) : String
}

`

module.exports = typeDefs;