import fs from "fs";
import pdf from "pdf-parse";
import lookupAirport from "../api/lookupAirport";
import { v4 as uuidv4 } from "uuid";

const airportCodeRegex = /^[A-Z]{4}$/;
const dvRegex = /^[A-Za-z]{1,2}[0-9]{1,2}$/;
const timeRegex = /^\d+\+\d+$/;
const potentialDvCodes = ['OST', 'TBD']

let listOfMissions = [];
let previousLeg = {
  DH: null,
  from: null,
  ddzulu: null,
  etdz: null,
  etdl: null,
  to: null,
  destAirport: null,
  airport: "",
  country: null,
  arrDate: null,
  etaz: null,
  etal: null,
  ete: null,
  dutyDay: null,
  destGroundTime: null,
  groundTime: "",
  dvcode: null,
};

function isValidDate(dat) {
  return /\b\d{2}-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(dat);
}
function isStartOfRow(concattedArray, rowStarted, previousString) {
  if (
    (!rowStarted &&
      airportCodeRegex.test(concattedArray[0]) &&
      !["NSTR", "GSOC", "NONE", "BASE"].includes(concattedArray[0]))
    ||
    (!rowStarted &&
      airportCodeRegex.test(concattedArray[1]) &&
      !["NSTR", "GSOC", "NONE", "BASE"].includes(concattedArray[1]))
    ||
    (!rowStarted && concattedArray[0] == 'DH' && concattedArray[1].length == 3)
    ||
    (!rowStarted && previousString == 'Intel')
  ) {
    return true
  }
  else {
    return false
  }
}
function validateTime(time) {
  if (timeRegex.test(time)) return true;
  else return false;
}

function render_page(pageData) {
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: true,
  };


  return pageData.getTextContent(render_options).then(async function (textContent) {
    let pageStarted = false;
    let rowStarted = false;

    let currentMission = {
      key: uuidv4(),
      missionNumber: "REVIEW",
      dvcode: "",
      legs: [],
    };

    let currentLeg = {
      key: uuidv4(),
      DH: false,
      from: null,
      ddzulu: null,
      etdz: null,
      etdl: null,
      to: null,
      destAirport: null,
      airport: previousLeg.destAirport,
      country: null,
      arrDate: null,
      etaz: null,
      etal: null,
      ete: null,
      dutyDay: null,
      destGroundTime: null,
      groundTime: previousLeg.destGroundTime,
      dvcode: null,
      isScuffed: false,
    };

    let previousString = "";
    let confirmedDvCode = "";
    let currentCol = 0;
    let pageNumber = 0;

    for await (let item of textContent.items) {
      const { str: currentString } = item;

      function updateMissionLegValue(key, currentString) {
        if (currentString.length === 1) {
          currentLeg.isScuffed = true;
          return;
        }
        else {
          currentLeg[key] = currentString;
          currentCol += 1;
        }
      }

      let concattedArray = currentString.split(/\s+/);

      if (dvRegex.test(currentString)) confirmedDvCode = currentString
      else if (potentialDvCodes.includes(currentString)) confirmedDvCode = currentString
      currentMission.dvcode = confirmedDvCode;

      if (currentString.toLowerCase().includes("dd zulu") && !pageStarted) {
        // We know that we are at the start of a page
        pageStarted = true;
        pageNumber += 1;
        continue;
      }

      if (pageStarted) {
        if (isStartOfRow(concattedArray, rowStarted, previousString)) {
          console.log(concattedArray)
          currentLeg = { dvcode: confirmedDvCode }
          rowStarted = true;
          currentCol += 1;
        }

        console.log(currentString + ' ' + currentCol)

        if (rowStarted) {
          switch (currentCol) {
            case 1:
              if (previousString === "DH") currentLeg.DH = true

              if (concattedArray.length === 1) {
                currentLeg.from = concattedArray[0];
                currentCol += 1;
                break;
              }

              if (concattedArray.length === 2 && concattedArray[0] == 'DH') {
                currentLeg.DH = true;
                currentLeg.from = concattedArray[1];
                currentCol += 1;
                break
              }

              if (concattedArray.length === 2 && airportCodeRegex.test(concattedArray[0])) {
                currentLeg.from = concattedArray[0];
                currentLeg.ddzulu = concattedArray[1];
                currentCol += 2;
                break
              }

              if (concattedArray.length === 3 && concattedArray[1] != 'BASE') {
                currentLeg.from = concattedArray[1];
                currentLeg.ddzulu = concattedArray[2];
                currentCol += 2;
                break;
              }

            case 2:
              updateMissionLegValue('ddzulu', currentString)
              break;
            case 3:
              updateMissionLegValue('etdz', currentString)
              break;
            case 4:
              updateMissionLegValue('etdl', currentString)
              break;
            case 5:
              updateMissionLegValue('to', currentString)
              break;

            case 6:
              currentLeg.airport = previousLeg.destAirport;
              updateMissionLegValue('destAirport', currentString)
              break;

            case 7:
              updateMissionLegValue('country', currentString)
              break;
            case 8:
              updateMissionLegValue('arrDate', currentString)
              break;
            case 9:
              updateMissionLegValue('etaz', currentString)
              break;
            case 10:
              updateMissionLegValue('etal', currentString)
              break;
            case 11:
              if (concattedArray.length === 2) {
                currentLeg.ete = concattedArray[0];
                currentLeg.dutyDay = concattedArray[1];
                currentCol += 2;
              } else if (concattedArray.length === 1) {
                currentLeg.ete = currentString;
                currentCol += 1;
              }
              break;

            case 12:
              currentLeg.dutyDay = currentString;
              currentLeg.groundTime = previousLeg.destGroundTime
                ? previousLeg.destGroundTime
                : "0+0";
              currentCol += 1;
              break;

            case 13:
              currentLeg.groundTime = previousLeg.destGroundTime
                ? previousLeg.destGroundTime
                : "0+0";
              if (timeRegex.test(currentString)) currentLeg.destGroundTime = currentString;
              else currentLeg.destGroundTime = "0+0";
              if (currentLeg.DH) currentLeg.dvcode = 'DH';

              if (!currentLeg.airport) currentLeg.airport = 'INITIAL'
              if (!isValidDate(currentLeg.arrDate)) {
                currentLeg.arrDate = '01-Jan-2000'
                currentLeg.isScuffed = true;
              }

              if(currentLeg.isScuffed) currentLeg.airport = '! '.concat(currentLeg.airport)

              currentLeg.key = uuidv4();
              currentMission.legs.push(currentLeg);
              currentCol = 0;
              rowStarted = false;
              previousLeg = currentLeg;
              break;
          }
        }
      }
      if (currentString.toLowerCase().includes("mission #") && pageStarted) {
        // we have found the mission number
        // also end of page
        if (currentLeg != previousLeg) currentMission.legs.push(currentLeg);
        previousLeg = {};
        currentMission.missionNumber = currentString.split(":")[1].trim();
        listOfMissions.push(currentMission);
        currentMission = {
          key: uuidv4(),
          dvcode: "",
          missionNumber: "",
          legs: [],
        };
        pageStarted = false;
      }
      previousString = currentString;
    }
    return listOfMissions;
  });
}

const options = {
  pagerender: render_page,
};

const processPDF = async (req, res) => {
  try {
    let dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer, options);
    res.json(listOfMissions);
    listOfMissions = [];
  } catch (error) {
    res.sendStatus(500);
  } finally {
    fs.unlink("./" + req.file.path, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }
};

export default processPDF;
