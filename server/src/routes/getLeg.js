import postgreSQLClient from "../postgres";

const getLeg = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { id } = req.query;

  try {
    const query = `
    SELECT *
    FROM legs
    WHERE id = $1
  `;

    const { rows } = await client.query(query, [id]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getLeg;
