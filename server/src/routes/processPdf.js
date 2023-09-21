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

      let airportCodeRegex = /^[A-Z]{4}$/;
      let concattedArray = currentString.split(/\s+/)

      if (pageStarted) {
        console.log(concattedArray[0], concattedArray)
          if(
              (!rowStarted &&
              airportCodeRegex.test(concattedArray[0]) &&
              !["NSTR","GSOC"].includes(concattedArray[0]))
              ||
              (!rowStarted &&
              airportCodeRegex.test(concattedArray[1]) &&
              !["NSTR","GSOC"].includes(concattedArray[1]))
            )
            {
              currentLeg = {      DH: null,
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
                dvcode:null,};
              rowStarted = true;
              currentCol += 1;
            }

        if (rowStarted) {
          switch (currentCol) {
            case 1:
              console.log("Current leg after processing: ", currentLeg)

              if (previousString === "DH") currentLeg.DH = previousString;

              if(concattedArray.length === 1){
                currentLeg.from = concattedArray[0];
              }

              if(concattedArray.length === 2){
                currentLeg.from = concattedArray[0];
                currentLeg.ddzulu = concattedArray[1];
              }

              if(concattedArray.length === 3){
                currentLeg.from = concattedArray[1];
                currentLeg.ddzulu = concattedArray[2];
                currentCol += 2;
                break;
              }

              currentCol += concattedArray.length;
              break;
            case 2:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.ddzulu = currentString;
              currentCol += 1;
              break;
            case 3:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.etdz = currentString;
              currentCol += 1;
              break;
            case 4:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.etdl = currentString;
              currentCol += 1;
              break;
            case 5:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.to = currentString;
              currentCol += 1;
              break;
            case 6:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.airport = previousLeg.destAirport,
              currentLeg.destAirport = currentString;
              currentCol += 1;
              break;
            case 7:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.country = currentString;
              currentCol += 1;
              break;
            case 8:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.arrDate = currentString;
              currentCol += 1;
              break;
            case 9:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.etaz = currentString;
              currentCol += 1;
              break;
            case 10:
              console.log("Current leg after processing: ", currentLeg)
              currentLeg.etal = currentString;
              currentCol += 1;
              break;
            case 11:
              console.log("Current leg after processing: ", currentLeg)
              if(concattedArray.length === 2){
                currentLeg.ete = concattedArray[0];
                currentLeg.dutyDay = concattedArray[1];
                currentCol += concattedArray.length;
                break
              }
              else if(concattedArray.length === 1){
                currentLeg.ete = concattedArray[0];
                currentCol += 1;
                break
              }
            case 12:
              console.log("Current leg after processing CASE 12: ", currentLeg)
              currentLeg.dutyDay = currentString;
              currentCol += 1;
              break;
            case 13:
              console.log("Current leg after processing: ", currentLeg)
              let timeRegex = /^\d+\+\d+$/;
              if(timeRegex.test(currentString)){
                currentLeg.groundTime = previousLeg.destGroundTime,
                currentLeg.destGroundTime = currentString;
              }
              else{
                currentLeg.groundTime = previousLeg.destGroundTime,
                currentLeg.destGroundTime = '';
              }              
              currentMission.legs.push(currentLeg);
              currentCol = 0;
              rowStarted = false;
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
