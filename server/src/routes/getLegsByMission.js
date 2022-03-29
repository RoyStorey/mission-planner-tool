import postgreSQLClient from "../postgres";

const getLegsByMission = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { mission } = req.query;

  try {
    const query = `
    SELECT *
    FROM legs
    WHERE mission_number = $1
    ORDER BY dd_zulu ASC
  `;

    const { rows } = await client.query(query, [mission]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getLegsByMission;
