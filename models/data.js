const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI


mongoose
    .connect(url)
    .then(() => {
        console.log("Conected to Database");
    })
    .catch((err) => console.log(err))


const dataSchema = new mongoose.Schema({
    date: Date,
    CO2: Number,
    VOC: Number,
    Temperature: Number,
    Humidity: Number,
    PM2_5: Number,
    PM10: Number,
})

dataSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


const DataModel = mongoose.model('Sensor_data', dataSchema)


module.exports = DataModel