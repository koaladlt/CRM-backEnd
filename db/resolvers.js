const User = require('../models/User')
const Product = require('../models/Product')
const Client = require('../models/Client')
const Orders = require('../models/Orders')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env' });

const createToken = (user, secretWord, expiresIn) => {

    const { id, email, name, lastName } = user
    return jwt.sign({ id }, secretWord, { expiresIn })

}

//resolvers 

const resolvers = {
    Query: {
        getUser: async (_, { token }) => {
            const userId = await jwt.verify(token, process.env.SECRET)

            return userId;
        },

        getProducts: async () => {
            try {
                const products = await Product.find({}) // Passing the empty object will bring all the products

                return products;

            } catch (error) {
                console.log(error)
            }
        },

        getProductById: async (_, { id }) => {

            const product = await Product.findById(id);

            if (!product) {
                throw new Error('Unable to find product')
            }

            return product;

        },

        getClients: async () => {
            try {

                const clients = await Client.find({});
                return clients;

            } catch (error) {
                console.log(error)
            }
        },

        getClientsBySeller: async (_, { }, ctx) => {

            try {
                const clients = await Client.find({ seller: ctx.user.id.toString() })
                return clients;
            } catch (error) {
                console.log(error)

            }
        },

        getClientById: async (_, { id }, ctx) => {

            const client = await Client.findById(id);

            if (!client) {
                throw new Error('We couldnt found the client ')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            return client;

        }

    },
    Mutation: {
        newUser: async (_, { input }) => {
            const { email, password } = input
            console.log(email)

            //Checking if user already exists
            const userExists = await User.findOne({ email })
            if (userExists) {
                throw new Error('User already exists')
            }


            //Hashing password

            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            //saving in DB

            try {
                const user = new User(input)
                user.save(); //Saving user in db
                return user;
            } catch (error) {
                console.log('Something went wrong', error)
            }
        },

        authenticateUser: async (_, { input }) => {
            const { email, password } = input;

            //Checking if user exists

            const userExists = await User.findOne({ email });
            if (!userExists) {
                throw new Error('User does not exist')
            }

            //Checking if password matches

            const passwordMatches = await bcryptjs.compare(password, userExists.password)
            if (!passwordMatches) {
                throw new Error('Your email or password are incorrect')
            }

            //Create the token 

            return {
                token: createToken(userExists, process.env.SECRET, '24h')
            }

        },

        newProduct: async (_, { input }) => {

            try {
                const product = new Product(input)

                //save in db
                const finalProduct = await product.save()

                return finalProduct;

            } catch (error) {

                console.log(error)

            }
        },

        updateProduct: async (_, { id, input }) => {

            let product = await Product.findById(id);

            if (!product) {
                throw new Error('unable to update Product')
            }

            // save db

            product = await Product.findOneAndUpdate({ _id: id }, input, { new: true })

            return product;
        },

        deleteProduct: async (_, { id }) => {
            let product = await Product.findById(id);

            if (!product) {
                throw new Error('unable to delete product')
            }

            await Product.findOneAndDelete({ _id: id });

            return "Product has been deleted";

        },

        newClient: async (_, { input }, ctx) => {

            const { email } = input

            console.log("este es el ctx: ", ctx)

            const client = await Client.findOne({ email });

            if (client) {
                throw new Error('Client has already been declared')
            }

            const newClient = new Client(input);
            newClient.seller = ctx.user.id

            try {

                const result = await newClient.save()

                return result;

            } catch (error) {

                console.log(error)
            }
        },

        updateClient: async (_, { id, input }, ctx) => {

            let client = await Client.findById(id);

            if (!client) {
                throw new Error('This client doesnt exist')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            await Client.findOneAndUpdate({ _id: id }, input, { new: true });

            return client;
        },

        deleteClient: async (_, { id }, ctx) => {
            let client = await Client.findById(id);

            if (!client) {
                throw new Error('This client doesnt exist')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            await Client.findOneAndDelete({ _id: id })

            return "Client has been deleted"
        },

        newOrder: async (_, { input }, ctx) => {

            const { client } = input

            let clientExists = await Client.findById(client);

            if (!clientExists) {
                throw new Error('The client doesnt exist')
            }

            if (clientExists.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            //Checking stock

            for await (const articulo of input.order) {

                // for await itera sobre cada elemento de manera asincrona

                const { id } = articulo;

                const product = await Product.findById(id);


                if (articulo.amount > product.stock) {
                    throw new Error(`The product: ${product.name} isn't in stock`)
                }
                else {
                    product.stock = product.stock - articulo.amount;

                    await product.save();
                }

            }

            const newOrder = new Orders(input);

            newOrder.seller = ctx.user.id;

            const result = await newOrder.save()

            return result;


        }
    }
}


module.exports = resolvers