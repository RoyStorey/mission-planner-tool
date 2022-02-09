import postgreSQLClient from "../postgres";

const lookupAirport = async (iata) => {
  const client = await postgreSQLClient.connect();
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
    return rows[0];
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default lookupAirport;
