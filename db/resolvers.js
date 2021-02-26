const User = require('../models/User')
const Product = require('../models/Product')
const Client = require('../models/Client')
const Orders = require('../models/Orders')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer');
const ejs = require("ejs");

require('dotenv').config({ path: 'variables.env' });

const createToken = (user, secretWord, expiresIn) => {
    console.log(user)
    const { id, email, name, lastName } = user
    return jwt.sign({ id, email, name, lastName }, secretWord, { expiresIn })

}

//resolvers 

const resolvers = {
    Query: {
        getUser: async (_, { }, ctx) => {
            console.log(ctx)
            return ctx.user
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

        },

        getOrders: async () => {
            try {
                const orders = await Orders.find({});

                return orders;

            } catch (error) {
                console.log(error);
            }
        },

        getOrdersBySeller: async (_, { }, ctx) => {
            try {
                const orders = await Orders.find({ seller: ctx.user.id }).populate('client')
                console.log(orders)
                return orders;
            } catch (error) {
                console.log(error)
            }
        },

        getOrderById: async (_, { id }, ctx) => {
            const order = await Orders.findById(id);
            if (!order) {
                throw new Error('We couldnt find the order')
            }

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            return order;
        },

        getOrdersByState: async (_, { state }, ctx) => {

            const orders = await Orders.find({ seller: ctx.user.id, state: state })

            return orders;
        },

        getBestClients: async () => {

            const clients = await Orders.aggregate([
                { $match: { state: 'COMPLETE' } },
                {
                    $group: {
                        _id: '$client',
                        total: { $sum: '$total' }
                    }
                },
                {
                    $lookup: {
                        from: 'clients',
                        localField: '_id',
                        foreignField: '_id',
                        as: "client"
                    },



                },
                { $sort: { total: -1 } }


            ]);

            return clients;
        },

        getBestSellers: async () => {
            const sellers = await Orders.aggregate([
                { $match: { state: "COMPLETE" } },
                {
                    $group: {
                        _id: "$seller",
                        total: { $sum: '$total' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1 }
                }
            ]);

            return sellers;
        },

        searchProduct: async (_, { text }) => {
            const products = await Product.find({ $text: { $search: text } })

            return products;
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

                var smtpTransport = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    auth: {
                        user: 'ecomerce0410@gmail.com',
                        pass: "henry1234."
                    }
                });

                smtpTransport.verify((error, success) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Server is ready to take messages');
                    }
                });

                ejs.renderFile(__dirname + "/NewUser.ejs", { name: user.name }, function (err, data) {
                    if (err) {
                        console.log(err)
                    } else {
                        var mainOptions = {
                            to: email,
                            from: 'Manuel de la Torre <foo@blurdybloop.com>',
                            subject: `Hello ${user.name}!`,
                            html: data,
                        };
                        smtpTransport.sendMail(mainOptions, function (err, info) {
                            if (err) {
                                res.json({
                                    msg: 'fail'
                                })
                            } else {
                                res.json({
                                    msg: 'success'
                                })
                            }
                        });
                    }
                })

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


        },

        updateOrder: async (_, { id, input }, ctx) => {
            const { client } = input;

            const orderExist = await Orders.findById(id);

            if (!orderExist) {
                throw new Error('The order doesnt exist')
            }

            const clientExist = await Client.findById(client);

            if (!clientExist) {
                throw new Error('The client doesnt exist')
            }

            if (clientExist.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            if (input.order) {
                for await (const articulo of input.order) {

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

            }



            const result = await Orders.findOneAndUpdate({ _id: id }, input, { new: true });

            return result;
        },

        deleteOrder: async (_, { id }, ctx) => {

            let order = await Orders.findById(id);

            if (!order) {
                throw new Error('This order doesnt exist')
            }

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error('You dont have the credentials')
            }

            await Orders.findOneAndDelete({ _id: id })

            return "The order has been deleted"
        }
    }
}


module.exports = resolvers