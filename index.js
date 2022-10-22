// express
const express = require('express')
const app = express()

//cors
const cors = require('cors')

app.use(cors())

// config
require('dotenv').config()
const node_password = process.env.NODE_PASSWORD


// models
const DataModel = require('./models/data')




// express parsers
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()      // create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })   // create application/x-www-form-urlencoded parser


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/data/:num_inst', (req, res) => {
    const instances = req.params.num_inst
    if(instances === undefined){
        res.status(400).json({error: 'No of instances unspecified'})
    }
    if(instances > 60){
        res.status(400).json({error: 'Too many instances requested, Not possible'})
    }
    DataModel.find({}).sort({_id:-1}).limit(instances).then(result => {
        res.json(result);
    }).catch(err => {
        console.log(err);
        res.json(err);
    })
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


// middleware 
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

