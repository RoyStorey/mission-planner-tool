import postgreSQLClient from "../postgres";

const getMissionsFromDateForOperator = async (req, res) => {
  const { startDate, endDate, operator } = req.query;
  const client = await postgreSQLClient.connect();

  try {
    const query = `
    SELECT *
    FROM legs
    WHERE dd_zulu >= $1
    AND dd_zulu <= $2
    AND $3=ANY(operators)
    ORDER BY dd_zulu DESC
  `;

    const { rows } = await client.query(query, [startDate, endDate, operator]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getMissionsFromDateForOperator;
