import express from "express";
import multer from "multer";
import processTXT from "./processTxt";
import confirmMissions from "./confirmMissions";
import getMissions from "./getMissions";
import getLegs from "./getLegs";

const upload = multer({ storage: multer.memoryStorage() }); // dest: "uploads/" for pdfs
const routes = express.Router();

routes.post("/processTXT", upload.single("file"), processTXT);
routes.post("/confirmMissions", confirmMissions);
routes.get("/getMissions", getMissions);
routes.get("/getLegs", getLegs);
routes.get("/", (req, res) => {
  res.json({ hello: "hi" });
});

export default routes;
