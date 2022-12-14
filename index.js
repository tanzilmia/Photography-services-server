const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nz3kcdw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWt (req,res,next){
  const authHeader = req.headers.authorization;
    if(!authHeader){
      return res.status(401).send({message: 'unauthorized Access'})

    }
    const token = authHeader.split(' ')[1] 
    jwt.verify(token, process.env.ASSCESS_TOKEN, function(err,decoded){
      if(err){
        return res.status(403).send({message: 'forbidden Access'})
      }
      req.decoded = decoded 
      next() 
    })
}


async function run(){
   try{
    const photographServices = client.db("DreamPhotoGraphy").collection("Services");
    const photographReview = client.db("DreamPhotoGraphy").collection("Reviews");

    app.post('/userreview', async (req,res)=>{
      const review = req.body
      const result = await photographReview.insertOne(review)
      res.send(result)
    })


    // post token 

    app.post('/jwt', (req,res)=>{   
      const user = req.body 
      const token = jwt.sign(user,process.env.ASSCESS_TOKEN, {expiresIn: '1h'})
      res.send({token}) 
    })

    app.get('/userreview', async (req,res)=>{
      let query = {}
      if(req.query.service_name){
         query = {
            service_name : req.query.service_name
         }
      }
   
      const cursor = photographReview.find(query);
      const reviews = await cursor.sort({time:'-1'}).toArray()
      res.send(reviews)
    })




    app.get('/myreviw', verifyJWt,  async (req,res)=>{
      if(req.decoded.email !== req.query.email){
       return  res.status(403).send({message : 'unauthorized access' })
      }

      let query = {}
      if(req.query.email){
         query = {
            email : req.query.email
         }
      }
      const cursor = photographReview.find(query);
      const myreview = await cursor.toArray()
      res.send(myreview)
    })


    app.put('/userreview/:id', async (req,res)=>{
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const options = { upsert: true }
      const edite = req.body
      const updateDoc = {
        $set: {
         review : edite.review
        },
      };
      
      const result = await photographReview.updateOne(query, updateDoc, options);
      res.send(result)
    })



     app.get('/shortservice', async (req,res)=>{
        const query = {}
        const cursor = photographServices.find(query);
        const services = await cursor.limit(3).toArray()
        res.send(services)
     })

   //   app.post('/services', async (req,res)
     app.post('/', async (req,res)=>{
      const addservices = req.body
      const result = await photographServices.insertOne(addservices)
      res.send(result)
    })

//   app.post('/services', async (req,res)
     app.get('/', async (req,res)=>{
        const query = {}
        const cursor = photographServices.find(query);
        const services = await cursor.toArray()
        res.send(services)
     })

   //   app.get('/services/:id', async (req,res)
     app.get('/:id', async (req,res)=>{
        const id = req.params.id
        const query = { _id:ObjectId(id)}
        const service = await photographServices.findOne(query)
        res.send(service)
     })


     app.get('/edite/:id', async (req,res)=>{
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const eteded = await photographReview.findOne(query)
      res.send(eteded) 
    
    })



     app.delete('/userreview/:id', async (req,res)=>{
      const id = req.params.id
      const query = { _id: ObjectId(id)}
      const result = await photographReview.deleteOne(query)
      res.send(result)
    })

   }



   finally{

   }
}
run().catch(err => console.log(err))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})