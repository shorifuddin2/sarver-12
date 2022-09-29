const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const { query } = require('express');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aoo1b.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
  const authHeader =req.headers.authorization;
  if(!authHeader){
    return res.status(401).send({message: 'UnAuthorized access'});

  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(error){
      return res.status(403).send({massage: 'Forbidden access'})
    }
    req.decoded = decoded; 
    next();
  });
   
}

//Function
async function run() {
  try {
    await client.connect();
    const productCollection = client.db('computer-parts').collection('products');
    const reviewCollection = client.db('computer-parts').collection('reviews');
    const userCollection = client.db('computer-parts').collection('users');
    const bookingCollection = client.db('computer-parts').collection('booking');

    
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      // console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
  });

    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });

    //review
    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

// add user
    app.get('/user',  async(req , res)=>{
    const users = await userCollection.find().toArray();
      res.send(users);
    });

    app.put('/user/:email',async(req, res)=>{
      const email = req.params.email;
      const user = req.body;
      const filter ={email}
      const options ={upsert: true};
      const updateDoc ={
        $set: {role:admin},
      };
      const result=await userCollection.updateOne(filter,updateDoc);
      
      res.send(result);
    });

    //Admin
    app.put('/user/admin',async(req, res)=>{
      const email = req.params.email;
      const user = req.body;
      const filter ={email}
      const options ={upsert: true};
      const updateDoc ={
        $set:user,
      };
      const result=await userCollection.updateOne(filter,updateDoc,options);
      const token = jwt.sign({email: email},process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
      res.send(result, token);
    })


    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
  });
    
  //Oder add
  app.get('/booking', async (req, res)=>{
    const email = req.query.email;
    const result = await bookingCollection.find({email : email}).toArray()
    res.send(result)
  })

  //post
  app.post('/product', async (req, res) =>{
    const newProduct = req.body;
    const result = await productCollection.insertOne(newProduct)
    res.setEncoding(result)
  })

  //post
  app.post('/review', async (req, res) =>{
    const newReview = req.body;
    const result = await reviewCollection.insertOne(newReview)
    res.setEncoding(result)
  })

  


  app.put('/api/users/profile', verifyJWT, async (req, res) => {
    const data = req.body;
    const filter = { email: data.email };
    const options = { upsert: true };
    const updateDoc = {
        $set: data,
    }
    const result = await profile.updateOne(filter, updateDoc, options);
    res.send(result);
   
}
  finally {

  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello  computer parts!')
})

app.listen(port, () => {
  console.log(`Computer Parts App listening on port ${port}`)
})