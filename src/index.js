const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const goalsRoutes = require("./routes/goals");
const teamsRoutes = require("./routes/teams");
const authRoutes = require("./routes/auth");
const { SECRET_KEY } = require("./config.js");
const checkJwt = require("express-jwt");

const app = express();

const SERVER_PORT = 4000;
const MONGODB_CONNECTION = "mongodb://localhost/clase11";

mongoose
  .connect(MONGODB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Base de datos lista");

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    const myLoggerMiddleware = (req, res, next) => {
      console.log(`Method ${req.method} | URL: ${req.url}`);
      next();
    };

    app.use(myLoggerMiddleware);

    app.use(morgan("dev"));

    app.use(
      "/goals",
      checkJwt({ secret: SECRET_KEY, algorithms: ["HS256"] }),
      goalsRoutes
    );
    app.use("/teams", teamsRoutes);
    app.use("/auth", authRoutes);

    app.use((req, res, next) => {
      res.status(404).send("Not found");
    });

    app.use((err, req, res, next) => {
      if (err.name === "ValidationError") {
        res.status(400).json({
          error: err.message,
        });
      } else {
        res.status(500).json({
          error: err.message,
        });
      }
    });

    app.listen(SERVER_PORT, () => {
      console.log(
        `Servidor listo para recibir conexiones en http://localhost:${SERVER_PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(error);

    mongoose.connection.close();
  });
