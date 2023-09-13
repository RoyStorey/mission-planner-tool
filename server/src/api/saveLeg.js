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
  dvcode,
  to,
}) => {
  const client = await postgreSQLClient.connect();
  try {
    const findExistingLeg = `
    SELECT *
    FROM legs
    WHERE "from" = $1
    AND "to" = $2
    AND airport = $3
    AND country = $4
    AND mission_number = $5
    `;

    const { rows: existingLegs } = await client.query(findExistingLeg, [
      from,
      to,
      airport,
      country,
      missionNumber,
    ]);

    if (existingLegs.length > 0) {
      const existingId = existingLegs[0].id;
      const updateLeg = `
      UPDATE legs
      SET dh = $1,
      "from" = $2,
      dd_zulu = $3,
      "to" = $4,
      airport = $5,
      country = $6,
      arrival_date = $7,
      ete = $8,
      duty_day = $9,
      gnd_time = $10,
      mission_number = $11,
      dvcode = $12
      WHERE id = $13
      RETURNING id;
      `;

      const { rows } = await client.query(updateLeg, [
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
        dvcode,
        existingId,
      ]);

      client.release();
      return rows[0];
    } else {
      const query = `
    INSERT INTO legs
      (dh,
      "from",
      dd_zulu,
      "to",
      airport,
      country,
      arrival_date,
      ete,
      duty_day,
      gnd_time,
      mission_number,
      dvcode) 
      values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
    RETURNING id;
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
        dvcode,
      ]);
      client.release();
      return rows[0];
    }
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default saveLeg;
