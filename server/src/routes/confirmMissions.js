import dayjs from "dayjs";
import Promise from "bluebird";
import saveMission from "../api/saveMission";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import saveLeg from "../api/saveLeg";
dayjs.extend(customParseFormat);
dayjs.extend(utc);

const confirmMissions = async (req, res) => {
  const { body: missions } = req;

  const listOfMissions = missions.map((mission) => [mission.missionNumber, mission.dvcode]);
  const listOfLegs = processLegs(missions);

  try {
    Promise.map(listOfMissions, async (missionNumber, dvcode) => {
      await saveMission(missionNumber, dvcode);
    });

    Promise.map(listOfLegs, async (leg) => {
      await saveLeg(leg);
    });
    res.json({ success: true });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
};

const processLegs = (missions) => {
  const unreducedLegs = missions.map((mission) =>
    mission.legs.map((leg) => ({
      ...leg,
      missionNumber: mission.missionNumber,
      // dvcode:mission.dvcode,
    }))
  );

  const listOfLegs = unreducedLegs.reduce((a, b) => a.concat(b));

  const listOfLegsWithFixedArrivalDates = listOfLegs.map((leg) => {
    const departureDate = dayjs.utc(
      `${leg.ddzulu} ${leg.etdz}`,
      "MM/DD/YYYY HH:mm"
    );
    const arrivalDate = dayjs.utc(
      `${leg.arrDate} ${leg.etaz}`,
      "MM/DD/YYYY HH:mm"
    );

    return {
      ...leg,
      ddzulu: departureDate.toISOString(),
      arrDate: arrivalDate.toISOString(),
    };
  });

  return listOfLegsWithFixedArrivalDates;
};

export default confirmMissions;
