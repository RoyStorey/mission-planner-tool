import saveLeg from "../api/saveLeg";
import lookupAirport from "../api/lookupAirport";
import getCountryISO3 from "country-iso-2-to-3";

const saveLegRoute = async (req, res) => {
  const {
    dh,
    from,
    dd_zulu,
    to,
    airport,
    arrival_date,
    ete,
    duty_day,
    gnd_time,
    mission_number,
    dvcode,
  } = req.body;

  try {
    const { iso_country } = (await lookupAirport(from)) || "UNK";
    const countryISO3 = getCountryISO3(iso_country);
    const result = await saveLeg({
      DH: dh,
      airport,
      arrDate: arrival_date,
      country: countryISO3,
      ddzulu: dd_zulu,
      dutyDay: duty_day,
      ete,
      from,
      groundTime: gnd_time,
      missionNumber: mission_number,
      dvcode,
      to,
    });
    res.json(result);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
};

export default saveLegRoute;
