const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nz3kcdw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//   const photographyDB = client.db("DreamPhotoGraphy").collection("Services");

async function run(){
   try{
    const photographServices = client.db("DreamPhotoGraphy").collection("Services");

     app.get('/', async (req,res)=>{
        const query = {}
        const cursor = photographServices.find(query);
        const services = await cursor.limit(3).toArray()
        res.send(services)
     })
     app.get('/services', async (req,res)=>{
        const query = {}
        const cursor = photographServices.find(query);
        const services = await cursor.toArray()
        res.send(services)
     })

     app.get('/services/:id', async (req,res)=>{
        const id = req.params.id
        const query = { _id:ObjectId(id)}
        const service = await photographServices.findOne(query)
        res.send(service)
     })

     
     

     
   }
   finally{

   }
}
run().catch(err => console.log(err))


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})