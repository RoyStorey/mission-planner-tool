import dayjs from "dayjs";
import Promise from "bluebird";
import saveMission from "../api/saveMission";
import customParseFormat from "dayjs/plugin/customParseFormat";
import saveLeg from "../api/saveLeg";
dayjs.extend(customParseFormat);

const confirmMissions = async (req, res) => {
  const { body: missions } = req;

  const listOfMissions = missions.map((mission) => mission.missionNumber);
  const listOfLegs = processLegs(missions);

  try {
    Promise.map(listOfMissions, async (missionNumber) => {
      await saveMission(missionNumber);
    });

    Promise.map(listOfLegs, async (leg) => {
      await saveLeg(leg);
    });
    res.json({ success: true });
  } catch (error) {
    res.json({ error });
  }
};

const processLegs = (missions) => {
  const unreducedLegs = missions.map((mission) =>
    mission.legs.map((leg) => ({
      ...leg,
      missionNumber: mission.missionNumber,
    }))
  );

  const listOfLegs = unreducedLegs.reduce((a, b) => a.concat(b));

  const listOfLegsWithFixedArrivalDates = listOfLegs.map((leg) => {
    const arrivalDate = dayjs(leg.arrDate, "DD-MMM");
    const arrivalMonth = arrivalDate.month();

    const currentDate = dayjs();
    const currentMonth = currentDate.month();
    const currentYear = currentDate.year();

    const fixedArrivalDate =
      arrivalMonth < currentMonth
        ? dayjs(`${leg.arrDate}-${currentYear + 1}`, "DD-MMM-YYYY")
        : dayjs(`${leg.arrDate}-${currentYear}`, "DD-MMM-YYYY");
    const fixedArrivalDateString = fixedArrivalDate.format("YYYY-MM-DD");

    const fixedDDZuluDate = dayjs(leg.ddzulu, "DD-MM-YY").format("YYYY-MM-DD");

    return {
      ...leg,
      ddzulu: fixedDDZuluDate,
      arrDate: fixedArrivalDateString,
    };
  });

  return listOfLegsWithFixedArrivalDates;
};

export default confirmMissions;
