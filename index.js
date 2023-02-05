const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const stripe = require("stripe")(
  "sk_test_51M6pynDoqXus93lmSCtHQmR7JIt71LFT43aufyCOEGOsJ714Cm8aBD473UAJVk2kDaMTcGwnyhxgk08CC95VcRs300KQPtK2Nt"
);
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

//midleware for verify jwt

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unAuthorised access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbiden access" });
    }
    req.decoded = decoded;
    next();
  });
};

async function run() {
  try {
    const allCategories = client
      .db("reselledProductsHub")
      .collection("collectionCategory");

    const usersCollection = client
      .db("reselledProductsHub")
      .collection("users");

    const allProductsCollection = client
      .db("reselledProductsHub")
      .collection("allProducts");
    const upcomingCollection = client
      .db("reselledProductsHub")
      .collection("upcomingProducts");

    const bookedProductsCollection = client
      .db("reselledProductsHub")
      .collection("bookedProducts");

    //midleware for verify admin to avoiding code repet

    // Note: make sure that you will run verifyAdmin function after verify JWT Function

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);
      if (user?.role !== "admin") {
        return res.status(403).send("forbidden Access");
      }
      next();
    };

    //get api for all category

    app.get("/categories", async (req, res) => {
      const query = {};
      const result = await allCategories.find(query).toArray();
      // console.log(result);
      res.send(result);
    });

    //get api for upcoming products

    app.get("/upcoming-product", async (req, res) => {
      const category = req.query.category;
      const query = {
        category: category,
      };
      const result = await upcomingCollection.find(query).toArray();
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

    //get api for jwt when user is logged in

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

    //post api for collecting user email with info

    app.post("/users", (req, res) => {
      const user = req.body;
      const result = usersCollection.insertOne(user);
      res.send(result);
    });

    //delete api for users collection

    app.delete("/users/:email", verifyJWT, verifyAdmin, async (req, res) => {
      const email = req.params.email;
      console.log("user delete", req.headers.authorization);
      const filter = { email: email };
      const result = await usersCollection.deleteOne(filter);
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

    // <==============all api for dashboard===========>

    //get api for all sellers

    app.get("/sellers", verifyJWT, verifyAdmin, async (req, res) => {
      const query = { type: "seller" };
      const sellers = await usersCollection.find(query).toArray();
      res.send(sellers);
      // console.log(sellers);
    });
    //get api for all buyers
    app.get("/buyers", verifyJWT, verifyAdmin, async (req, res) => {
      const query = { type: "buyer" };
      const buyers = await usersCollection.find(query).toArray();
      res.send(buyers);
      // console.log(req.headers.authorization);
    });

    //get api for picking admin user
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    //get api for buyers products
    app.get("/buyersproducts", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const myProducts = await bookedProductsCollection.find(query).toArray();
      res.send(myProducts);
    });

    //get  booking info by id
    app.get("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookedProductsCollection.findOne(query);
      res.send(result);
    }),
      //delete products from booking
      app.delete("/booking/:id", async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await bookedProductsCollection.deleteOne(filter);

        res.send(result);
      }),
      //get api for sellers products
      app.get("/sellersproducts", async (req, res) => {
        const email = req.query.email;

        const query = {
          email: email,
        };
        const myProducts = await allProductsCollection.find(query).toArray();

        res.send(myProducts);
      }),
      app.put("/sellersproducts/:id", verifyJWT, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            advertise: "advertise",
          },
        };
        const result = await allProductsCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      }),
      app.delete("/sellersporducts/:id", async (req, res) => {
        const id = req.params.id;

        const filter = { _id: ObjectId(id) };
        const result = await allProductsCollection.deleteOne(filter);

        res.send(result);
      }),
      //get api for picking advertised Products
      app.get("/allproducts/advertise", async (req, res) => {
        const query = { advertise: "advertise" };
        const products = await allProductsCollection.find(query).toArray();
        res.send(products);
      }),
      //get api for picking seller user
      app.get("/users/seller/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        res.send({ isSeller: user?.type === "seller" });
      }),
      // put api for verify user
      app.put(
        "/users/seller/:email",
        verifyJWT,
        verifyAdmin,
        async (req, res) => {
          const email = req.params.email;
          console.log("seller verify", req.headers.authorization);
          const query = { email: email };
          const options = { upsert: true };
          const updatedDoc = {
            $set: {
              status: "verified",
            },
          };
          const result = await usersCollection.updateOne(
            query,
            updatedDoc,
            options
          );
          res.send(result);
        }
      ),
      //get api for picking verified user
      app.get("/users/verified/:email", async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        res.send({ isVerified: user?.status === "verified" });
      });
    //Api for payment system

    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
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
