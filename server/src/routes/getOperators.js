import postgreSQLClient from "../postgres";

const getOperators = async (req, res) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    SELECT *
    FROM users
    ORDER BY name ASC
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

export default getOperators;
