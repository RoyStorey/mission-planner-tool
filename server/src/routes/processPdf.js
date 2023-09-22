import fs from "fs";
import pdf from "pdf-parse";
import lookupAirport from "../api/lookupAirport";

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

function render_page(pageData) {
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: true,
  };

  return pageData
    .getTextContent(render_options)
    .then(async function (textContent) {
      let pageStarted = false;
      let rowStarted = false;

      let currentMission = {
        missionNumber: "",
        dvcode: "",
        legs: [],
      };
      let currentLeg = {
        DH: null,
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
      };
      const dvRegex = /^[A-Za-z]{1,2}[0-9]{1,2}$/;

      let previousString = "";
      let currentCol = 0;
      let pageNumber = 0;
      let hopefullyTheDvcode = "";

      for await (let item of textContent.items) {
        const { str: currentString } = item;

        if (dvRegex.test(currentString)) {
          hopefullyTheDvcode = currentString;
        }

        if (currentString.toLowerCase().includes("dd zulu") && !pageStarted) {
          // We know that we are at the start of a page
          pageStarted = true;
          pageNumber += 1;
          continue;
        }

        if (currentString.toLowerCase().includes("mission #") && pageStarted) {
          // we have found the mission number
          // also end of page
          if (currentLeg != previousLeg) {
            currentMission.legs.push(currentLeg);
          }
          previousLeg = {};
          currentMission.missionNumber = currentString.split(":")[1].trim();
          listOfMissions.push(currentMission);
          currentMission = { missionNumber: "", legs: [] };
          pageStarted = false;
        }

        let airportCodeRegex = /^[A-Z]{4}$/;
        let concattedArray = currentString.split(/\s+/);

        if (pageStarted) {
          if (
            (!rowStarted &&
              airportCodeRegex.test(concattedArray[0]) &&
              !["NSTR", "GSOC"].includes(concattedArray[0])) ||
            (!rowStarted &&
              airportCodeRegex.test(concattedArray[1]) &&
              !["NSTR", "GSOC"].includes(concattedArray[1]))
          ) {
            currentLeg = {};
            rowStarted = true;
            currentCol += 1;
          }
          if (rowStarted) {
            switch (currentCol) {
              case 1:
                if (hopefullyTheDvcode.length === 0) {
                  currentLeg.dvcode = "TBD";
                  currentMission.dvcode = "TBD";
                } else {
                  currentLeg.dvcode = hopefullyTheDvcode;
                  currentMission.dvcode = hopefullyTheDvcode;
                }

                if (previousString === "DH") currentLeg.DH = previousString;

                if (concattedArray.length === 1) {
                  currentLeg.from = concattedArray[0];
                }

                if (concattedArray.length === 2) {
                  currentLeg.from = concattedArray[0];
                  currentLeg.ddzulu = concattedArray[1];
                }

                if (concattedArray.length === 3) {
                  currentLeg.from = concattedArray[1];

                  currentLeg.ddzulu = concattedArray[2];
                  currentCol += 2;
                  break;
                }

                currentCol += concattedArray.length;
                break;
              case 2:
                currentLeg.ddzulu = currentString;
                currentCol += 1;
                break;
              case 3:
                currentLeg.etdz = currentString;
                currentCol += 1;
                break;
              case 4:
                currentLeg.etdl = currentString;
                currentCol += 1;
                break;
              case 5:
                currentLeg.to = currentString;
                currentCol += 1;
                break;
              case 6:
                const { name } = (await lookupAirport(currentLeg.from)) || "";
                if (currentLeg.airport != name) {
                  currentLeg.airport = name;
                } else if (name.length === 0) {
                  currentLeg.airport = previousLeg.destAirport;
                }
                currentLeg.destAirport = currentString;
                currentCol += 1;
                break;
              case 7:
                currentLeg.country = currentString;
                currentCol += 1;
                break;
              case 8:
                currentLeg.arrDate = currentString;
                currentCol += 1;
                break;
              case 9:
                currentLeg.etaz = currentString;
                currentCol += 1;
                break;
              case 10:
                currentLeg.etal = currentString;
                currentCol += 1;
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
                let timeRegex = /^\d+\+\d+$/;
                if (timeRegex.test(currentString)) {
                  currentLeg.destGroundTime = currentString;
                } else {
                  currentLeg.destGroundTime = "0+0";
                }
                currentMission.legs.push(currentLeg);
                currentCol = 0;
                rowStarted = false;
                previousLeg = { ...currentLeg };
                break;

              default:
            }
          }
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
    fs.unlink("./" + req.file.path, (err) => {
      if (err) {
        console.log(err);
      }
    });
    res.json(listOfMissions);
    listOfMissions = [];
  } catch (error) {
    res.sendStatus(500);
  }
};

export default processPDF;
