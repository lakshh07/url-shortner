const express = require("express");
const shortId = require("short-id");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin-lakshay:hello123@cluster0.q9ftl.mongodb.net/urlDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }
);

const shortUrlSchema = new mongoose.Schema({
  full: {
    type: String,
    required: true,
  },
  short: {
    type: String,
    required: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
});
const Url = mongoose.model("Url", shortUrlSchema);

app.get("/", function (req, res) {
  Url.find({}, function (err, foundUrl) {
    res.render("home", { shortUrls: foundUrl });
  });
});

app.post("/shortUrls", function (req, res) {
  const shorturl = new Url({
    full: req.body.fullUrl,
    short: shortId.generate(),
  });
  shorturl.save();
  res.redirect("/");
});

app.post("/delete", function (req, res) {
  const urlId = req.body.urlId;
  Url.findByIdAndRemove(urlId, function (err) {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.get("/:shortUrl", async function (req, res) {
  const shortUrl = req.params.shortUrl;
  const surl = await Url.findOne({ short: shortUrl });
  if (surl === null) {
    return res.sendStatus(404);
  } else {
    surl.clicks++;
    surl.save();
    res.redirect(surl.full);
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started Successfully");
});
