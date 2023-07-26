const express = require('express')
const app = express();
const accountSid = 'AC7a6ad271ff2649bdf2a30896a3c2d0cf';
const authToken = '118c386f55cf96c9fa75fee0eca25517';
const client = require('twilio')(accountSid, authToken);
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
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


app.use(bodyParser.json());

const razorpay = new Razorpay({
    key_id: 'rzp_test_A5ShsUIeS7nRnr',
    key_secret: '79NApKzlilz2Ep4v5kSNzMLb',
});

// Route to generate payment link
app.post('/payment',async  (req, res) => {
    const { amount } = req.body;

    // You can customize the order_id as per your requirements
    const options = {
        amount: amount * 100, // Amount is in paisa (so multiply by 100 for rupees)
        currency: 'INR', // Set the currency to Indian Rupee (INR)
        receipt: 'order_receipt',
        payment_capture: 1, // Auto-capture payments (1 for true, 0 for false)
    };

    const order = await razorpay.orders.create(options);

    let link =await razorpay.paymentLink.create({
        amount: amount*100,
        currency: "INR",
        accept_partial: true,
        first_min_partial_amount: 100,
        description: "For XYZ purpose",
        customer: {
          name: "Gaurav Kumar",
          email: "gaurav.kumar@example.com",
          contact: "+919000090000"
        },
        notify: {
          sms: true,
          email: true
        },
        reminder_enable: true,
        notes: {
          policy_name: "Jeevan Bima"
        },
        callback_url: "https://backend-defence-vidya.onrender.com/payment-callback",
        callback_method: "get"
      })
    res.send({
        link:link.short_url
    })
});


app.get('/payment-callback', async (req, res) => {
  // Get the payment ID and other details from the query parameters
  const { payment_id, order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.query;

  // Verify the signature for security purposes
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', 'YOUR_RAZORPAY_SECRET_KEY');
  hmac.update(`${order_id}|${razorpay_payment_id}`);
  const generatedSignature = hmac.digest('hex');

  // Compare the generated signature with the received signature
  if (generatedSignature === razorpay_signature) {
    // Signature is valid, process the payment success here
    // You can update your database, send payment confirmation, etc.

    // Respond with 200 status to Razorpay to acknowledge the successful callback
    res.status(200).end();
  } else {
    // Invalid signature, the callback might be tampered
    // Handle the error scenario here
    res.status(400).send('Invalid Signature');
  }
});


const PORT = process.env.PORT || 8000;
const server = http.createServer(app)
server.listen(PORT, () => {
    console.log("Server is running on the port", PORT)
})
