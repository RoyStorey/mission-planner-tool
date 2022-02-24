import postgreSQLClient from "../postgres";

const deleteOperator = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { id } = req.body;

  try {
    const query = `
    DELETE FROM users
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

export default deleteOperator;
