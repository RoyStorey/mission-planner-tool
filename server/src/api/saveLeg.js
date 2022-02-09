import postgreSQLClient from "../postgres";

const saveLeg = async ({
  DH,
  airport,
  arrDate,
  country,
  ddzulu,
  dutyDay,
  etal,
  etaz,
  etdl,
  etdz,
  ete,
  from,
  groundTime,
  missionNumber,
  to,
}) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    INSERT INTO legs
    (dh,"from",dd_zulu,etd_z,etd_l,"to",airport,country,arrival_date,eta_z,eta_l,ete,duty_day,gnd_time,mission_number) 
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
  `;

    const { rows } = await client.query(query, [
      DH,
      from,
      ddzulu,
      etdz,
      etdl,
      to,
      airport,
      country,
      arrDate,
      etaz,
      etal,
      ete,
      dutyDay,
      groundTime,
      missionNumber,
    ]);

    client.release();
    return rows[0];
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default saveLeg;
