import postgreSQLClient from "../postgres";

const saveMission = async (missionNumber, dvcode) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    INSERT INTO missions
    (mission_number, dvcode)
    values
    ($1, $2)
    ON CONFLICT DO NOTHING
  `;

    const { rows } = await client.query(query, missionNumber);

    client.release();
    return rows[0];
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default saveMission;
