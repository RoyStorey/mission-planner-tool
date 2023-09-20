import fs from "fs";
import pdf from "pdf-parse";

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
  destGroundTime:null,
  groundTime: "",
  dvcode:null,
};

function render_page(pageData) {
  let render_options = {
    normalizeWhitespace: true,
    disableCombineTextItems: true,
  };

  return pageData.getTextContent(render_options).then(function (textContent) {
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
      dvcode:null,
    };
    let previousString = "";
    let currentCol = 0;
    let pageNumber = 0;

    for (let item of textContent.items) {
      const { str: currentString } = item;

      if (currentString.toLowerCase().includes("dd zulu") && !pageStarted) {
        // We know that we are at the start of a page
        pageStarted = true;
        pageNumber += 1;
        continue;
      }

      if (currentString.toLowerCase().includes("mission #") && pageStarted) {
        // we have found the mission number
        // also end of page
        currentMission.missionNumber = currentString.split(":")[1].trim();
        listOfMissions.push(currentMission);
        currentMission = { missionNumber: "", dvcode: "", legs: [] };
        pageStarted = false;
      }

      if (pageStarted) {
        if (
          currentString.trim().length === 4 &&
          !rowStarted &&
          currentString === currentString.toUpperCase() &&
          !["NSTR"].includes(currentString)
        ) {
          currentLeg = {};
          rowStarted = true;
          currentCol += 1;
        }
        if (rowStarted) {
          switch (currentCol) {
            case 1:
              if (previousString === "DH") currentLeg.DH = previousString;

              let airportCodeRegex = /^[A-Z]{4}$/;
              let concattedAirportArray = currentString.split(" ").map(item=>item.trim())
              console.log(currentString, concattedAirportArray)

              if(concattedAirportArray.length == 1 && airportCodeRegex.test(concattedAirportArray[0])){
                currentLeg.from = concattedAirportArray[0];
                currentCol += 1;
                console.log('1')
                break
              }
              else if(concattedAirportArray.length == 2 && airportCodeRegex.test(concattedAirportArray[0])){
                currentLeg.from = concattedAirportArray[0];
                currentLeg.ddzulu = concattedAirportArray[1]
                currentCol += 2;
                console.log('2')
                break
              }
              else if(concattedAirportArray.length == 3 && airportCodeRegex.test(concattedAirportArray[1])){
                currentLeg.from = concattedAirportArray[1];
                currentLeg.ddzulu = concattedAirportArray[2]
                currentCol += 2;
                console.log('3')
                break
              }
              else{
                console.log('4')
                break
              }

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
              currentLeg.airport = previousLeg.destAirport,
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
              currentLeg.ete = currentString;
              currentCol += 1;
              break;
            case 12:
              currentLeg.dutyDay = currentString;
              currentCol += 1;
              break;
            case 13:
              let timeRegex = /^\d+\+\d+$/;
              if(timeRegex.test(currentString)){
                currentLeg.groundTime = previousLeg.destGroundTime,
                currentLeg.destGroundTime = currentString;
              }
              else{
                currentLeg.groundTime = previousLeg.destGroundTime,
                currentLeg.destGroundTime = '';
              }
              currentCol = 0;
              rowStarted = false;
              currentMission.legs.push(currentLeg);
              previousLeg = currentLeg;
              break;
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
    return res.json(listOfMissions);
  } catch (error) {
    console.log(error, "ERROR");
    res.sendStatus(500);
  }
};

export default processPDF;
