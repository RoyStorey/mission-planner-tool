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
    (dh,"from",dd_zulu,"to",airport,country,arrival_date,ete,duty_day,gnd_time,mission_number) 
    values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
  `;

    const { rows } = await client.query(query, [
      DH,
      from,
      ddzulu,
      to,
      airport,
      country,
      arrDate,
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
