import postgreSQLClient from "../postgres";
import dayjs from "dayjs";

const getMissionsOnDate = async (req, res) => {
  const { date } = req.query;

  const client = await postgreSQLClient.connect();

  const startDate = dayjs.utc(date).startOf("day").toISOString();
  const endDate = dayjs.utc(date).endOf("day").toISOString();
  try {
    const query = `
    SELECT *
    FROM legs
    WHERE dd_zulu <= $1
    AND dd_zulu >= $2
  `;

    const { rows } = await client.query(query, [endDate, startDate]);

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getMissionsOnDate;
