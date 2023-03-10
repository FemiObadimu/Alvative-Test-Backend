require("dotenv").config();
require("express-async-errors");
const request = require("request");
const cors = require("cors");
const express = require("express");
const { initializePayment, verifyPayment } = require("./paystack")(request);
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", async function (req, res, next) {
  res.json({ msg: "App Works Well" });
});

app.post("/initialize", async function (req, res, next) {
  console.log(req.body);
  const { email, name } = req.body;
  const amount = 500;
  const callback_url = "https://alvative-test-frontend.vercel.app/verify";

  const data = {
    email,
    amount,
    callback_url,
    metadata: {
      custom_fields: [
        {
          display_name: `${name}`,
          variable_name: `${name}`,
          value: "payment-gateway",
        },
      ],
    },
  };

  initializePayment(data, async (error, body) => {
    if (error) {
      return res.status(400).json({
        msg: `${error.message}`,
        status: "invalid",
      });
    }
    const response = JSON.parse(body.body);
    return res.status(200).json({ response, status: "valid" });
  });
});

app.get("/verification", async function (req, res, next) {
  const ref = req.query.reference;
  verifyPayment(ref, async (error, body) => {
    if (error) {
      return res
        .status(400)
        .json({ msg: `${error.message}`, status: "invalid" });
    }

    const response = JSON.parse(body.body);
    if (response.data.authorization.bin.length < 1) {
      return res.status(400).json({
        msg: `Card Not Verified, Please Try Again`,
        status: "invalid",
      });
    }

    return res.status(200).json({
      response,
      msg: "Card Verification Successful",
      status: "valid",
    });
  });
});

app.get("/get-transactions", function (req, res, next) {
  const options = {
    method: "GET",
    url: "https://api.paystack.co/transaction",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_APP_KEY}`,
      "Content-type": "application/json",
    },
  };
  request(options, async function (error, body) {
    if (error) {
      return res
        .status(400)
        .json({ msg: `${error.message}`, status: "invalid" });
    }
    const response = JSON.parse(body.body);
    return res
      .status(200)
      .json({ ans: response.data.slice(0, 5), status: "valid" });
  });
});

app.listen(5000, function () {
  console.log("Server Started Peacefully");
});
