import postgreSQLClient from "../postgres";

const updateMOTD = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { text } = req.body;
  try {
    const query = `
    UPDATE motd
    set text = $1
    WHERE id = 1
  `;

    const { rows } = await client.query(query, [text]);

    client.release();
    res.json(rows[0]);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default updateMOTD;
