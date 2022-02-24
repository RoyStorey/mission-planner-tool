import postgreSQLClient from "../postgres";

const addOperator = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { name } = req.body;

  try {
    const query = `
    INSERT INTO users (name)
    VALUES ($1)
    RETURNING id
  `;

    const { rows } = await client.query(query, [name]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default addOperator;
