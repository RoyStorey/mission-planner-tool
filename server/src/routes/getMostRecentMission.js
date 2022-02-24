import postgreSQLClient from "../postgres";

const getMostRecentMission = async (req, res) => {
  const { date } = req.query;
  const client = await postgreSQLClient.connect();

  try {
    const query = `
    SELECT *
    FROM legs
    WHERE dd_zulu <= $1
    ORDER BY dd_zulu DESC
    LIMIT 1
  `;

    const { rows } = await client.query(query, [date]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getMostRecentMission;
