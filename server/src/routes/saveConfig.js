import postgreSQLClient from "../postgres";

const saveConfig = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { groundTime: ground_time, countries: country_codes } = req.body;

  try {
    const query = `
    UPDATE config
    SET country_codes = $1, ground_time = $2
    WHERE id = 1
  `;

    const { rows } = await client.query(query, [country_codes, ground_time]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default saveConfig;
