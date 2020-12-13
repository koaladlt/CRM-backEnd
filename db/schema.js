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

type Client {
    id: ID
    name: String
    lastName: String
    company: String
    email: String
    phone: String
    seller: ID
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

input ClientInput {
    name: String!
    lastName: String!
    company: String!
    email: String!
    phone: String

}

type Query { 

    # User
    getUser (token: String!): User

    # Product

    getProducts: [Product]
    getProductById(id: ID!) : Product

    #Clients 

    getClients: [Client]
    getClientsBySeller: [Client]
    getClientById(id: ID!): Client
}

type Mutation {

    # User
    newUser(input: UserInput) : User
    authenticateUser(input: AuthenticateInput) : Token

    #Product
    newProduct(input: ProductInput) : Product
    updateProduct(id: ID!, input: ProductInput) : Product
    deleteProduct(id:ID!) : String

    # Client
    newClient(input: ClientInput): Client
    updateClient(id: ID!, input: ClientInput): Client
    deleteClient(id:ID!): String
}

`

module.exports = typeDefs;