const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true


        })
        console.log('DB Connected')
    } catch (error) {
        console.log('there was an error: ')
        console.log(error)
        process.exit(1);
    }
}

module.exports = connectDb;