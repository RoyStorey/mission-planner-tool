import postgreSQLClient from "../postgres";
import dayjs from "dayjs";

const getMissionsUpcoming = async (req, res) => {
  const { date, type } = req.query;

  const client = await postgreSQLClient.connect();

  const startDate = dayjs.utc(date).startOf("day").toISOString();
  const endDate = dayjs.utc(date).add(7, "day").endOf("day").toISOString();
  try {
    const query =
      type === "home"
        ? `
    SELECT *
    FROM legs
    WHERE dd_zulu <= $1
    AND dd_zulu >= $2
    ORDER BY dd_zulu ASC
  `
        : `SELECT *
  FROM legs
  WHERE dd_zulu >= $1
  ORDER BY dd_zulu ASC`;

    const { rows } = await client.query(
      query,
      type === "home" ? [endDate, startDate] : [startDate]
    );

    client.release();
    res.json(rows);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getMissionsUpcoming;
