const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();

//middleware

app.use(cors());
app.use(express.json());

// mongodb database setup

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jz1qjld.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const usedLaptopCollections = client
  .db("reselledProductsHub")
  .collection("LaptopCollections");
// perform actions on the collection object

app.get("/", (req, res) => {
  res.send("Used Product Resel server is running Perfectly");
});

app.listen(port, () => {
  console.log(`Used product resel site is running on port ${port}`);
});
