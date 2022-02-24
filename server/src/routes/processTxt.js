import readline from "readline";
import { Duplex } from "stream";
import lookupAirport from "../api/lookupAirport";
import { v4 as uuidv4 } from "uuid";
import getCountryISO3 from "country-iso-2-to-3";
import getConfig from "../api/getConfig";

const bufferToStream = (buffer) => {
  let tmp = new Duplex();
  tmp.push(buffer);
  tmp.push(null);
  return tmp;
};

const processTXT = async (req, res) => {
  try {
    const config = await getConfig();
    const fileContents = req.file.buffer;
    const fileStream = bufferToStream(fileContents);

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let listOfMissions = [];

    let currentMission = {
      key: uuidv4(),
      missionNumber: "",
      legs: [],
    };

    let processingBegin = false;

    for await (const line of rl) {
      if (line.includes("Mission #:")) {
        currentMission.missionNumber = line.split(/\s/g)[3].trim();
        continue;
      }

      if (line.includes("DD Zulu")) {
        processingBegin = true;
        continue;
      }

      if (line.trim().includes("Planned Pax Count")) {
        listOfMissions.push(currentMission);
        currentMission = { key: uuidv4(), missionNumber: "", legs: [] };
        processingBegin = false;
        continue;
      }

      if (processingBegin) {
        let splitLine = line.match(/([^\r^\n^\t]+)/gs); // ([^\s]+)
        if (splitLine?.length === 1) splitLine = line.split(/[\s]{2,}/g); // To get erroneous entries seperated by spaces

        if (line.trim().length === 0 || splitLine === null) continue;
        if (splitLine.length <= 5) continue;

        if (splitLine[0] === "DH") {
          const { iso_country } = (await lookupAirport(splitLine[1])) || "";
          const countryISO3 = getCountryISO3(iso_country);
          const groundTime = splitLine[13]?.split("+")[0];
          const processLeg =
            groundTime >= config.ground_time ||
            config.country_codes.includes(countryISO3);
          if (!processLeg) continue;

          const currentLeg = {
            key: uuidv4(),
            DH: splitLine[0],
            from: splitLine[1],
            ddzulu: splitLine[2],
            etdz: splitLine[3],
            etdl: splitLine[4],
            to: splitLine[5],
            airport: splitLine[6],
            country: splitLine[7],
            arrDate: splitLine[8],
            etaz: splitLine[9],
            etal: splitLine[10],
            ete: splitLine[11],
            dutyDay: splitLine[12],
            groundTime: splitLine[13],
          };
          currentMission.legs.push(currentLeg);
          continue;
        }

        const { iso_country } = (await lookupAirport(splitLine[0])) || "";
        const countryISO3 = getCountryISO3(iso_country);
        const groundTime = splitLine[12]?.split("+")[0];
        const processLeg =
          groundTime >= config.ground_time ||
          config.country_codes.includes(countryISO3);
        if (!processLeg) continue;

        const currentLeg = {
          key: uuidv4(),
          DH: null,
          from: splitLine[0],
          ddzulu: splitLine[1],
          etdz: splitLine[2],
          etdl: splitLine[3],
          to: splitLine[4],
          airport: splitLine[5],
          country: splitLine[6],
          arrDate: splitLine[7],
          etaz: splitLine[8],
          etal: splitLine[9],
          ete: splitLine[10],
          dutyDay: splitLine[11],
          groundTime: splitLine[12],
        };
        currentMission.legs.push(currentLeg);
        continue;
      }
    }
    // console.log(listOfMissions);
    res.json(listOfMissions);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
};

export default processTXT;
