import express from "express";
import multer from "multer";
import processTXT from "./processTxt";
import confirmMissions from "./confirmMissions";
import getMissions from "./getMissions";
import getMissionsOnDate from "./getMissionsOnDate";
import getMissionsUpcoming from "./getMissionsUpcoming";
import getLegs from "./getLegs";
import getCountryCodes from "./getCountryCodes";

const upload = multer({ storage: multer.memoryStorage() }); // dest: "uploads/" for pdfs
const routes = express.Router();

routes.post("/processTXT", upload.single("file"), processTXT);
routes.post("/confirmMissions", confirmMissions);
routes.get("/getMissions", getMissions);
routes.get("/getMissionsOnDate", getMissionsOnDate);
routes.get("/getMissionsUpcoming", getMissionsUpcoming);
routes.get("/getCountryCodes", getCountryCodes);
routes.get("/getLegs", getLegs);

export default routes;
