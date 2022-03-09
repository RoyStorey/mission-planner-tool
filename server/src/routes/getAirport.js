import postgreSQLClient from "../postgres";

const getAirport = async (req, res) => {
  const client = await postgreSQLClient.connect();
  const { iata } = req.body;

  try {
    const query = `
    SELECT *
    FROM airports
    WHERE ident = $1
    OR gps_code = $1
    OR iata_code = $1;
  `;

    const { rows } = await client.query(query, [iata]);

    client.release();
    res.json(rows[0]);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getAirport;
