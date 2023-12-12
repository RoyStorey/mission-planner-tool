import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export default async function txtToMissionObject(pathToTextFile) {
  const dhRegex = /^DH$/;
  const fromAndToRegex = /^[A-Z]{4}$/;
  const ddzuluRegex = /^\d{2}-[A-Z][a-z]{2}-\d{2}$/;
  const timeColonRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  const ctryRegex = /^[A-Za-z]{3}$/;
  const arrDateRegex = /^\d{2}-[A-Z][a-z]{2}$/;
  const timePlusRegex = /^\d+\+[0-5]?\d$/;

  function identifyPlusToFour(string) {
    if (string == undefined) return false;
    if (string.split("").includes("+")) return false;
    if (string.length == 4 && string.split("")[1] == "4") {
      return true;
    }
    if (string.length == 5 && string.split("")[2] == "4") {
      return true;
    }
    return false;
  }

  function replaceFourWithPlus(string) {
    if (string.length == 4 && string.split("")[1] == "4") {
      let splitString = string.split("");
      splitString[1] = "+";
      return splitString.join("");
    }
    if (string.length == 5 && string.split("")[2] == "4") {
      let splitString = string.split("");
      splitString[2] = "+";
      return splitString.join("");
    }
    return string;
  }

  let currentMission = {
    key: uuidv4(),
    missionNumber: "REVIEW",
    dvcode: "",
    legs: [],
  };

  function getData(pathToTextFile) {
    try {
      const data = fs.readFileSync(pathToTextFile, "utf-8");
      return data;
    } catch (e) {
      console.log(e);
    }
  }

  let data = getData(pathToTextFile);

  if (data) {
    const lines = data.split("\n");
    let previousLeg = {};

    lines.forEach((line) => {
      let currentLeg = {
        key: uuidv4(),
        DH: false,
        from: null,
        ddzulu: null,
        etdz: null,
        etdl: null,
        to: null,
        destAirport: null,
        //we want departure airport, not dest. therefore this should be the previous leg's dest airport.
        airport: previousLeg.destAirport || null,
        country: null,
        arrDate: null,
        etaz: null,
        etal: null,
        ete: null,
        dutyDay: null,
        destGroundTime: null,
        //we want departure groundtime, not dest. therefore this should be the previous leg's dest groundtime.
        groundTime: previousLeg.destGroundTime || null,
        dvcode: null,
      };

      let isLeg = false;
      let splitLine = line.split(" ").filter((item) => item);
      console.log(splitLine);

      if (splitLine[0] == "Mission") {
        currentMission.missionNumber = splitLine[2];
      }

      if (splitLine[0] == "Aircraft:") {
        currentMission.dvcode = splitLine[5];
        currentLeg.dvcode = splitLine[5];
      }

      //if line is a header row
      if (splitLine[0] == "DH" && splitLine[1] == "From") {
      }

      //if line is a leg
      if (
        (fromAndToRegex.test(splitLine[0]) &&
          !["GSOC", "BASE"].includes(splitLine[0])) ||
        (dhRegex.test(splitLine[0]) &&
          fromAndToRegex.test(splitLine[1]) &&
          !["GSOC", "BASE"].includes(splitLine[1]))
      ) {
        isLeg = true;
      }
      if (isLeg) {
        let airportNameOffset = 0;
        let airportName = [];
        currentLeg.dvcode = currentMission.dvcode;
        if (splitLine[0] == "DH") currentLeg.DH = true;
        if (!currentLeg.DH) {
          currentLeg.from = fromAndToRegex.test(splitLine[0])
            ? splitLine[0]
            : "faultySyntax";
          currentLeg.ddzulu = ddzuluRegex.test(splitLine[1])
            ? splitLine[1]
            : "faultySyntax";
          currentLeg.etdz = timeColonRegex.test(splitLine[2])
            ? splitLine[2]
            : "faultySyntax";
          currentLeg.etdl = timeColonRegex.test(splitLine[3])
            ? splitLine[3]
            : "faultySyntax";
          currentLeg.to = fromAndToRegex.test(splitLine[4])
            ? splitLine[4]
            : "faultySyntax";
          airportNameOffset = 5;
        }
        if (currentLeg.DH) {
          currentLeg.from = fromAndToRegex.test(splitLine[1])
            ? splitLine[1]
            : "faultySyntax";
          currentLeg.ddzulu = ddzuluRegex.test(splitLine[2])
            ? splitLine[2]
            : "faultySyntax";
          currentLeg.etdz = timeColonRegex.test(splitLine[3])
            ? splitLine[3]
            : "faultySyntax";
          currentLeg.etdl = timeColonRegex.test(splitLine[4])
            ? splitLine[4]
            : "faultySyntax";
          currentLeg.to = fromAndToRegex.test(splitLine[5])
            ? splitLine[5]
            : "faultySyntax";
          airportNameOffset = 6;
        }
        while (!arrDateRegex.test(splitLine[airportNameOffset + 1])) {
          airportName.push(splitLine[airportNameOffset]);
          airportNameOffset++;
        }
        currentLeg.destAirport = airportName.join(" ");

        currentLeg.country = ctryRegex.test(splitLine[airportNameOffset + 0])
          ? splitLine[airportNameOffset + 0]
          : "faultySyntax";
        currentLeg.arrDate = arrDateRegex.test(splitLine[airportNameOffset + 1])
          ? splitLine[airportNameOffset + 1]
          : "faultySyntax";
        currentLeg.etaz = timeColonRegex.test(splitLine[airportNameOffset + 2])
          ? splitLine[airportNameOffset + 2]
          : "faultySyntax";
        currentLeg.etal = timeColonRegex.test(splitLine[airportNameOffset + 3])
          ? splitLine[airportNameOffset + 3]
          : "faultySyntax";

        if (timePlusRegex.test(splitLine[airportNameOffset + 4])) {
          currentLeg.ete = splitLine[airportNameOffset + 4];
        }
        if (identifyPlusToFour(splitLine[airportNameOffset + 4])) {
          currentLeg.ete = replaceFourWithPlus(
            splitLine[airportNameOffset + 4]
          );
        }

        if (timePlusRegex.test(splitLine[airportNameOffset + 5])) {
          currentLeg.dutyDay = splitLine[airportNameOffset + 5];
        }
        if (identifyPlusToFour(splitLine[airportNameOffset + 5])) {
          currentLeg.dutyDay = replaceFourWithPlus(
            splitLine[airportNameOffset + 5]
          );
        }

        if (timePlusRegex.test(splitLine[airportNameOffset + 6])) {
          currentLeg.destGroundTime = splitLine[airportNameOffset + 6];
        }
        if (identifyPlusToFour(splitLine[airportNameOffset + 6])) {
          currentLeg.destGroundTime = replaceFourWithPlus(
            splitLine[airportNameOffset + 6]
          );
        }

        currentMission.legs.push(currentLeg);
        previousLeg = { ...currentLeg };
      }
    });
  }
  // console.log(currentMission);
  //   console.log(currentLeg);
  return currentMission;
}

// txtToMissionObject("./output/0.txt");
