const express = require('express')
const app = express();
const accountSid = 'AC7a6ad271ff2649bdf2a30896a3c2d0cf';
const authToken = '118c386f55cf96c9fa75fee0eca25517';
const client = require('twilio')(accountSid, authToken);
const cors = require('cors')
app.use(cors());

const nodemailer = require('nodemailer');
const admin = require("firebase-admin")

const credentials = require("./configure.json")

const http = require('http');
const { hostname } = require('os');
admin.initializeApp({
    credential: admin.credential.cert(credentials)
})
app.use(express.json())

// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

app.use(express.urlencoded({ extended: true }));
const db = admin.firestore();





const PORT = process.env.PORT || 8080;
const server = http.createServer(app)
server.listen(PORT, () => {
    console.log("Server is running on the port", PORT)
})