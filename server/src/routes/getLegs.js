import postgreSQLClient from "../postgres";

const getLegs = async (req, res) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    SELECT *
    FROM legs
  `;

    const { rows } = await client.query(query);

    client.release();
    res.json(rows);
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default getLegs;
