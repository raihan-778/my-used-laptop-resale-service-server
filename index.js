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

    //get api for all category

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await usedLaptopCollections.find(query).toArray();
      console.log(result);
      res.send(result);
    });

    //post api for collecting user email with info

    app.post("/users", (req, res) => {
      const user = req.body;
      const result = usersCollection.insertOne(user);
      res.send(user);
    });

    //get api to check if the user is admin or not

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //api for admin role to update user info

    app.put("/users/admin/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //get api for jsonwebtoken

    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, {
          expiresIn: "1h",
        });
        return res.send({ accessToken: token });
      }
      console.log(user);
      res.status(403).send({ accessToken: "unauthorised User" });
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
