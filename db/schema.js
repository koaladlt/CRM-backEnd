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

type Order {
    id: ID
    order: [OrderGroup]
    total: Float
    client: ID
    seller: ID
    date: String
    state: StateOrder
}

type OrderGroup {
    id: ID
    amount: Int
}


type Token {
    token: String
}

type TopClient {
    total: Float
    client: [Client]
}

type TopSeller {
    total: Float
    seller: [User]
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

input OrderProductInput {
    id: ID
    amount: Int

}

input OrdersInput {

    order: [OrderProductInput]
    total: Float
    client: ID
    state: StateOrder
}

enum StateOrder {
    PENDING
    COMPLETE
    CANCELLED
}

type Query { 

    # User
    getUser: User

    # Product

    getProducts: [Product]
    getProductById(id: ID!) : Product

    #Clients 

    getClients: [Client]
    getClientsBySeller: [Client]
    getClientById(id: ID!): Client

    # Orders

    getOrders: [Order]
    getOrdersBySeller: [Order]
    getOrderById(id: ID!): Order
    getOrdersByState(state: String!): [Order]

    # AdvancedSearch

    getBestClients: [TopClient]
    getBestSellers: [TopSeller]
    searchProduct(text: String!): [Product]
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

    # Orders
    newOrder(input: OrdersInput): Order
    updateOrder(id: ID!, input: OrdersInput): Order
    deleteOrder(id: ID!): String
    
}

`

module.exports = typeDefs;