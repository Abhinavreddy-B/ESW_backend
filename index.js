// express
const express = require('express')
const app = express()

// frontend
app.use(express.static('build'))


//cors
const cors = require('cors')

app.use(cors())

// config
require('dotenv').config()
const node_password = process.env.NODE_PASSWORD
const gmail_username = process.env.GMAIL_USERNAME
const gmail_password = process.env.GMAIL_PASSWORD


// models
const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI
mongoose
    .connect(url)
    .then(() => {
        console.log("Conected to Database");
    })
    .catch((err) => console.log(err))
const DataModel = require('./models/data')
const EmailModel = require('./models/email')




// express parsers
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()      // create application/json parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })   // create application/x-www-form-urlencoded parser


/// email
var nodemailer = require('nodemailer')
let transporter = nodemailer.createTransport({
    host: "smtp.outlook.com",
    auth: {
        user: gmail_username,
        pass: gmail_password
    }
})
var randomstring = require("randomstring");



app.get('/api/data/:num_inst', (req, res) => {
    const instances = req.params.num_inst
    if (instances === undefined) {
        res.status(400).json({ error: 'No of instances unspecified' })
    }
    if (instances > 60) {
        res.status(400).json({ error: 'Too many instances requested, Not possible' })
    }
    DataModel.find({}).sort({ _id: -1 }).limit(instances).then(result => {
        res.json(result.reverse());
    }).catch(err => {
        console.log(err);
        res.json(err);
    })
})

app.post('/api/data', jsonParser, (req, res) => {
    if (req.body === undefined) {
        return res.status(400).json({ error: 'content missing' })
    }
    const body = req.body
    if (body.length != 7) {
        return res.status(400).json({ error: 'missing parameters/extra data' })
    }
    if (body[0] != node_password) {
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

app.post('/api/email/', jsonParser, (req, res) => {
    body = req.body
    console.log(body)
    if (body === undefined) {
        res.status(400).json({ err: "missing body" })
    }

    const new_email = new EmailModel({
        date: new Date(),
        email: body.email,
        Validated: false,
        Password: randomstring.generate(11),
        Alt_email: randomstring.generate(11)
    })

    new_email.save().then(result => {
        console.log('Saved Email , (unverified)');
        res.status = 200
        res.json(result);
    }).catch(err => {
        console.log("Couldnt add to database")
        console.log(err)
    })

    var mailOptions = {
        from: gmail_username,
        to: body.email,
        subject: 'Verification',
        text: `Click This To Verify your email https://indoor-air-pollution-18.herokuapp.com/api/email/validate/${new_email.Alt_email}/${new_email.Password}`,
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
            res.status = 400;
            res.json("Error");
        } else {
            console.log("Succesfull email", info.response);
            res.status = 200;
            res.json("Done");
        }
    })

})

app.get('/api/email/validate/:altemail/:passwd', (req, res) => {
    const alt_email = req.params.altemail
    const passwd = req.params.passwd
    console.log(alt_email,passwd)
    EmailModel.updateMany({ Alt_email: alt_email, Password: passwd }, {
        $set: {
            Validated: true,
        },
    }).then((result) => {
        console.log(result);
        // var mailOptions = {
        //     from: gmail_username,
        //     to: body.email,
        //     subject: 'Verified',
        //     text: `Verification Succesfull`,
        // }
    
        // transporter.sendMail(mailOptions, (err, info) => {
        //     if (err) {
        //         console.log(err);
        //         res.status(400)
        //     } else {
        //         console.log("Succesfull email", info.response);
        //     }
        // })

        res.status(200).send("<body><h1>Email Verified.</h1><br><p>You will start recieving alerts</p>")
    }).catch((err) => {
        console.log(err);
        res.status(400).json({err: "internal"})
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

