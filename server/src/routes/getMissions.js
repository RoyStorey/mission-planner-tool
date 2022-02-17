import postgreSQLClient from "../postgres";

const getMissions = async (req, res) => {
  const client = await postgreSQLClient.connect();

  const { pageSize, page } = req.query;
  const offset = pageSize * (page - 1);

  try {
    const query = `
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

    const { rows, count } = await client.query(query, [offset, pageSize]);

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
