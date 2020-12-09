const User = require('../models/User')
const bcryptjs = require('bcryptjs')


//resolvers 

const resolvers = {
    Query: {
        obtenerCurso: () => '...'
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
        }
    }
}


module.exports = resolvers