const User = require('../models/User')
const Product = require('../models/Product')
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
        }
    }
}


module.exports = resolvers