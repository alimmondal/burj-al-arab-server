const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config()
const { MongoClient } = require('mongodb');


// console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.es092.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const port = 5000

const app = express();
app.use(cors());
app.use(bodyParser.json());



var serviceAccount = require("./configs/burj-al-arab-4f784-firebase-adminsdk-v5jtr-46cc4ee4aa.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});






const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("booking");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        //   console.log(newBooking);
    })


    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            admin.auth()
                .verifyIdToken(idToken)
                .then(decodedToken => {
                    let tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;
                    if (tokenEmail == queryEmail) {
                          bookings.find({email: queryEmail})
                          .toArray((err, documents) => {
                              res.status(200).send(documents);
                          })
                    }
                    else {
                        res.status(401).send('un-authorized access');
                    }
                })
                .catch((error) => {
                    res.status(401).send('un-authorized access');
                });
        }
        else {
            res.status(401).send('un-authorized access');
        }

    })





    console.log('db connected successfully')
    //   client.close();
});





// app.get('/', (req, res) => {
//     res.send('hello world')
// })

app.listen(port);


