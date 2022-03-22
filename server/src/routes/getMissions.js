import postgreSQLClient from "../postgres";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const getMissions = async (req, res) => {
  const client = await postgreSQLClient.connect();

  const { pageSize, page, filter: passedFilter } = req.query;
  const offset = pageSize * (page - 1);
  const filter = passedFilter ? JSON.parse(req.query.filter) : null;

  const specificDateSelected = filter?.date
    ? {
        start: dayjs.utc(filter.date).startOf("day").toISOString(),
        end: dayjs.utc(filter.date).endOf("day").toISOString(),
      }
    : null;

  const specificSearchQuery = filter?.query ? filter.query : null;

  try {
    const query =
      specificDateSelected && specificSearchQuery
        ? `
    SELECT
    (SELECT COUNT(*) 
      FROM legs
      WHERE dd_zulu >= $1
      AND dd_zulu <= $2
      AND (
        mission_number ILIKE $3
        OR "from" ILIKE $3
        OR "to" ILIKE $3
        OR airport ILIKE $3
      )
    ) as count, 
    (SELECT json_agg(t.*) FROM (
        SELECT * FROM legs
        WHERE dd_zulu >= $1
        AND dd_zulu <= $2
        AND (
          mission_number ILIKE $3
          OR "from" ILIKE $3
          OR "to" ILIKE $3
          OR airport ILIKE $3
        )
        ORDER BY dd_zulu DESC
        OFFSET $4
        LIMIT $5
    ) AS t) AS rows 
    `
        : specificSearchQuery
        ? `SELECT
          (SELECT COUNT(*) 
            FROM legs
            WHERE mission_number ILIKE $1
            OR "from" ILIKE $1
            OR "to" ILIKE $1
            OR airport ILIKE $1
          ) as count, 
          (SELECT json_agg(t.*) FROM (
              SELECT * FROM legs
              WHERE mission_number ILIKE $1
              OR "from" ILIKE $1
              OR "to" ILIKE $1
              OR airport ILIKE $1
              ORDER BY dd_zulu DESC
              OFFSET $2
              LIMIT $3
          ) AS t) AS rows `
        : specificDateSelected
        ? `
    SELECT
    (SELECT COUNT(*) 
      FROM legs
      WHERE dd_zulu >= $1
      AND dd_zulu <= $2
    ) as count, 
    (SELECT json_agg(t.*) FROM (
        SELECT * FROM legs
        WHERE dd_zulu >= $1
        AND dd_zulu <= $2
        ORDER BY dd_zulu DESC
        OFFSET $3
        LIMIT $4
    ) AS t) AS rows 
  `
        : `
  SELECT
  (SELECT COUNT(*) 
   FROM legs
  ) as count, 
  (SELECT json_agg(t.*) FROM (
      SELECT * FROM legs
      ORDER BY dd_zulu DESC
      OFFSET $1
      LIMIT $2
  ) AS t) AS rows 
`;

    const { rows, count } = await client.query(
      query,
      specificDateSelected && specificSearchQuery
        ? [
            specificDateSelected.start,
            specificDateSelected.end,
            specificSearchQuery,
            offset,
            pageSize,
          ]
        : specificSearchQuery
        ? [specificSearchQuery, offset, pageSize]
        : specificDateSelected
        ? [
            specificDateSelected.start,
            specificDateSelected.end,
            offset,
            pageSize,
          ]
        : [offset, pageSize]
    );

    client.release();
    res.json({ rows, count });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
    client.release();
  }
};

export default getMissions;
