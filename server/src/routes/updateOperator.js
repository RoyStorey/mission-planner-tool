import postgreSQLClient from "../postgres";

const updateOperator = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { id, name } = req.body;

  try {
    const query = `UPDATE users
    SET name = $1
    WHERE id = $2
  `;

    const { rows } = await client.query(query, [name, id]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default updateOperator;
