import postgreSQLClient from "../postgres";

const getCountryCodes = async (req, res) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    SELECT alpha3
    FROM country_codes
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

export default getCountryCodes;
