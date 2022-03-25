const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/User");
const Product = require("./db/Product");
const Jwt = require("jsonwebtoken");
const jwtKey = "e-comm";
const app = express();

app.use(express.json());
app.use(cors());
app.post("/register", async (req, res) => {
  // console.log(req.body.name, req.body.email, req.body.password);
  let user = new User(req.body);
  let result = await user.save();
  result = result.toObject();
  delete result.passowrd;
  Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
    if (err) {
      res.send({ result: "somthing went wrong,Please try again!!!" });
    }
    res.send({ result, auth: token });
  });

  // res.send(req.body.name, req.body.email, req.body.password);
});
app.post("/login", async (req, res) => {
  if (req.body.password && req.body.email) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
          res.send({ result: "somthing went wrong,Please try again!!!" });
        }
        res.send({ user, auth: token });
      });
    } else {
      res.send({ result: "No User Fond!!!" });
    }
  } else {
    res.send({ result: "No User Fond!!!" });
  }
});

app.post("/add-product", async (req, res) => {
  let product = new Product(req.body);
  let result = await product.save();
  res.send(result);
});

app.get("/products", async (req, res) => {
  let products = await Product.find();
  if (products.length > 0) {
    res.send(products);
  } else {
    res.send({ result: "No products found !!!" });
  }
});

app.delete("/product/:id", async (req, res) => {
  const result = await Product.deleteOne({ _id: req.params.id });
  res.send(result);
});
app.get("/product/:id", async (req, res) => {
  let result = await Product.findOne({ _id: req.params.id });
  if (result) {
    res.send(result);
  } else {
    res.send({ result: "No record found !!!" });
  }
});

app.put("/product/:id", async (req, res) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: req.body,
    }
  );
  res.send(result);
});

app.get("/search/:key", async (req, res) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
    ],
  });
  res.send(result);
});

// function verifyToken(req, res, next) {
//   let token = req.headers["authorization"];
//   if (token) {
//     token = token.split(" ")[1];
//     console.log("middleware called", token);
//     Jwt.verify(token, jwtKey, (err, valid) => {
//       if (err) {
//         res.status(401).send({ result: "Please provide valid token" });
//       } else {
//         next();
//       }
//     });
//   } else {
//     res.status(403).send({ result: "Please add token with header" });
//   }
// }
app.listen(5000);
