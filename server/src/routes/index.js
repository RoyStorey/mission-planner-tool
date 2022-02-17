import express from "express";
import multer from "multer";
import processTXT from "./processTxt";
import addEntryForLeg from "./addEntryForLeg";
import confirmMissions from "./confirmMissions";
import getEntriesForLeg from "./getEntriesForLeg";
import getMissions from "./getMissions";
import getMissionsOnDate from "./getMissionsOnDate";
import getMissionsUpcoming from "./getMissionsUpcoming";
import getLeg from "./getLeg";
import getLegs from "./getLegs";
import getCountryCodes from "./getCountryCodes";
import deleteMission from "./deleteMission";
import updateMission from "./updateMission";

const upload = multer({ storage: multer.memoryStorage() }); // dest: "uploads/" for pdfs
const routes = express.Router();

routes.post("/processTXT", upload.single("file"), processTXT);
routes.post("/confirmMissions", confirmMissions);
routes.post("/updateMission", updateMission);
routes.post("/deleteMission", deleteMission);
routes.post("/addEntryForLeg", addEntryForLeg);
routes.get("/getMissions", getMissions);
routes.get("/getMissionsOnDate", getMissionsOnDate);
routes.get("/getMissionsUpcoming", getMissionsUpcoming);
routes.get("/getCountryCodes", getCountryCodes);
routes.get("/getLegs", getLegs);
routes.get("/getLeg", getLeg);
routes.get("/getEntriesForLeg", getEntriesForLeg);

export default routes;
