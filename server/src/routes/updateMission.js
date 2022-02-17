import postgreSQLClient from "../postgres";

const updateMission = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const {
    id,
    dh,
    from,
    dd_zulu,
    to,
    airport,
    arrival_date,
    gnd_time,
    mission_number,
  } = req.body;

  try {
    const query = `
    UPDATE legs
    SET dh = $1, "from" = $2, dd_zulu = $3, "to" = $4, airport = $5, arrival_date = $6, gnd_time = $7, mission_number = $8
    WHERE id = $9
  `;

    const { rows } = await client.query(query, [
      dh,
      from,
      dd_zulu,
      to,
      airport,
      arrival_date,
      gnd_time,
      mission_number,
      id,
    ]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default updateMission;
