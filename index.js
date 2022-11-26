const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

require("dotenv").config();

//middleware

app.use(cors());
app.use(express.json());

// mongodb database setup

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jz1qjld.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

/* DB_USER="reselledProductsHub"
DB_PASSWORD="q8rEGaBol0bzCJ2x" */

// perform actions on the collection object

async function run() {
  try {
    const usedLaptopCollections = client
      .db("reselledProductsHub")
      .collection("LaptopCollections");
    const allCategories = client
      .db("reselledProductsHub")
      .collection("collectionCategory");

    const usersCollection = client
      .db("reselledProductsHub")
      .collection("users");

    const allProductsCollection = client
      .db("reselledProductsHub")
      .collection("allProducts");

    const bookedProductsCollection = client
      .db("reselledProductsHub")
      .collection("bookedProducts");

    //get api for all category

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await allCategories.find(query).toArray();
      // console.log(result);
      res.send(result);
    });

    app.get("/categories/:categoryName", async (req, res) => {
      const categoryName = req.params.categoryName;
      const query = {
        categoryName: categoryName,
      };
      const products = await allProductsCollection.find(query).toArray();

      res.send(products);
    });

    //get api for  category wise product using id

    //post api for collecting user email with info

    app.post("/users", (req, res) => {
      const user = req.body;
      const result = usersCollection.insertOne(user);
      res.send(result);
    });

    //get api for getting products collection

    app.get("/allproducts", async (req, res) => {
      const query = {};
      const result = await allProductsCollection.find(query).toArray();
      res.send(result);
    });

    //post api for all products db
    app.post("/allproducts", async (req, res) => {
      const product = req.body;
      const result = await allProductsCollection.insertOne(product);
      res.send(result);
    });

    //post api for booked product collection
    app.post("/booking", async (req, res) => {
      const bookedProduct = req.body;
      const result = await bookedProductsCollection.insertOne(bookedProduct);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Used Product Resel server is running Perfectly");
});

app.listen(port, () => {
  console.log(`Used product resel site is running on port ${port}`);
});
