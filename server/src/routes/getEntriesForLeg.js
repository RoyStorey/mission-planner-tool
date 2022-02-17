import postgreSQLClient from "../postgres";

const getEntriesForLeg = async (req, res) => {
  const { leg_id } = req.query;

  const client = await postgreSQLClient.connect();

  try {
    const query = `
    SELECT *
    FROM entries
    WHERE leg_id = $1
    ORDER BY date ASC
  `;

    const { rows } = await client.query(query, [leg_id]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getEntriesForLeg;
