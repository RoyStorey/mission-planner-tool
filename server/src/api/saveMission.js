import postgreSQLClient from "../postgres";

const saveMission = async (missionNumber) => {
  const client = await postgreSQLClient.connect();
  try {
    const query = `
    INSERT INTO missions
    (mission_number)
    values
    ($1)
    ON CONFLICT DO NOTHING
  `;

    const { rows } = await client.query(query, [missionNumber]);

    const cleanupQuery = `
      DELETE FROM legs
      WHERE mission_number = $1
    `;

    const deleteOld = await client.query(cleanupQuery, [missionNumber]);

    client.release();
    return rows[0];
  } catch (error) {
    console.log(error);
    client.release();
  }
};

export default saveMission;
