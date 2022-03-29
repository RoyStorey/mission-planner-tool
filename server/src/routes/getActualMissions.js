import postgreSQLClient from "../postgres";

const getActualMissions = async (req, res) => {
  const client = await postgreSQLClient.connect();

  try {
    const query = `
    SELECT DISTINCT mission_number
    FROM legs
    ORDER BY mission_number DESC
  `;

    const { rows } = await client.query(query);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getActualMissions;
