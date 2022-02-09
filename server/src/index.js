import express from "express";
import routes from "./routes";
import cors from "cors";

const app = express();
const port = process.env.PORT;

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(cors());

app.use("/", routes);

app.listen(port, () => {
  console.log(`App is running on ${port}.`);
});
