import postgreSQLClient from "../postgres";

const getMOTD = async (req, res) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    SELECT *
    FROM motd
  `;

    const { rows } = await client.query(query);

    client.release();
    res.json(rows[0]);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getMOTD;
