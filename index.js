const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()


var bodyParser = require('body-parser')
// create application/json parser
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


const http = require('http')

// if (process.argv.length < 3) {
//     console.log('Please provide the password as an argument: node mongo.js <password>')
//     process.exit(1)
// }

// const password = process.argv[2]

// const url = `mongodb+srv://Taggedee_Lee:${password}@cluster0.kerst.mongodb.net/?retryWrites=true&w=majority`
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

const DataModel = mongoose.model('Sensor_data', dataSchema)

const node_password = process.env.NODE_PASSWORD

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    response.json(notes)
})

app.post('/api/data', jsonParser, (req, res) => {
    const body = req.body
    if(body === undefined){
        return res.status(400).json({ error: 'content missing' })
    }
    if(body.length != 7){
        return res.status(400).json({ error: 'missing parameters/extra data' })
    }
    if(body[0] != node_password){
        return res.status(400).json({ error: 'Authentication Failed' })
    }
    console.log(body);
    const new_data_in = new DataModel({
        date: new Date(),
        CO2: body[1],
        VOC: body[2],
        Temperature: body[3],
        Humidity: body[4],
        PM2_5: body[5],
        PM10: body[6],
    })
    new_data_in.save().then(result => {
        console.log('Saved Note');
        res.status = 200
        res.json(result);
    }).catch(err => {
        console.log("Couldnt add to database")
        console.log(err)
    })
})

// app.post('/api/data', jsonParser, (request, response) => {
//     const body = request.body
//     console.log(body);
//     if (body === undefined) {
//         return response.status(400).json({ error: 'content missing' })
//     }

//     const note = new Note({
//         content: body.content,
//         important: body.important || false,
//         date: new Date(),
//     })

//     note.save().then(savedNote => {
//         response.json(savedNote)
//     })
// })

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})