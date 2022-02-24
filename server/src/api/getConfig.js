import postgreSQLClient from "../postgres";

const getConfig = async () => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    SELECT *
    FROM config
  `;

    const { rows } = await client.query(query);

    client.release();
    return rows[0];
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default getConfig;
