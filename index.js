const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

console.log(process.env.DB_PASS)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.491qx.mongodb.net/burjArab?retryWrites=true&w=majority`;
const port = 5000;


const app = express();

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./configs/burj-arab-8ef63-firebase-adminsdk-59kr9-9882985a86.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});






const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const bookings = client.db("burjArab").collection("bookings");
    //console.log('db connected successfully')
    // perform actions on the collection object

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
                // console.log(result);
            })
        // console.log(newBooking);
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            // idToken comes from the client app
            admin
                .auth()
                .verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = re.query.email;
                    if (tokenEmail == queryEmail) {
                        bookings.find({ email: queryEmail })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else {
                        res.status(401).send('un authorized access')
                    }
                    console.log({ uid });
                })
                .catch((error) => {
                    res.status(401).send('un authorized access');
                });
        }
        else {
            res.status(401).send('un authorized access')
        }
    })

});

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port)