import postgreSQLClient from "../postgres";

const addEntryForLeg = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { entry, date, leg_id } = req.body;

  try {
    const query = `
    INSERT INTO entries (entry, date, leg_id)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

    const { rows } = await client.query(query, [entry, date, leg_id]);

    client.release();
    res.json(rows[0]);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default addEntryForLeg;
