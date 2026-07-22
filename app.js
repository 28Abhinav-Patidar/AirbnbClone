// Trigger restart to load new env
if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingrouter = require("./routs/listing.js");
const reviewrouter = require("./routs/review.js");
const userrouter = require("./routs/user.js");
const aiRouter = require("./routs/ai");

const port = process.env.PORT || 4000;

const DB_URL = process.env.ATLASDB_URL;
main().then(() => {
    console.log("DB connected")
}).catch((err) => {
    console.log(err);
});
async function main() {
    await mongoose.connect(DB_URL);
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = MongoStore.create({
    mongoUrl: DB_URL,
    touchAfter: 24 * 3600,
    collectionName: "sessions",
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR:", err);
});
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};



app.use(Session(sessionOptions));


app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.get("/", (req, res) => {
    res.redirect("/listing");
});
app.use("/listing", listingrouter);
app.use("/listing/:id/review", reviewrouter);
app.use("/", userrouter);
app.use("/ai", aiRouter);

app.get("/.well-known/appspecific/com.chrome.devtools.json", (req, res) => {
    res.sendStatus(204);
});

app.get("/favicon.ico", (req, res) => {
    res.status(204).end();
});

app.use((req, res, next) => {
    if (req.originalUrl === "/.well-known/appspecific/com.chrome.devtools.json") {
        return next();
    }

    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    console.error("=== EXPRESS ERROR HANDLER TRIGGERED ===");
    console.error(err);
    console.error("=====================================");
    let { statusCode = 500, message = "Something went Wrong!" } = err;

    res.status(statusCode).render("includes/Error", { message });
});


app.listen(port, () => {
    console.log("Server is running on port", port);
});