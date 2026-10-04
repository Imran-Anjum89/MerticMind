module.exports = {
  dbType: process.env.SNOWFLAKE_ACCOUNT ? 'snowflake' : 'duckdb',
  schemaPath: 'model',
  
  queryRewrite: (query, { securityContext }) => {
    // Governed query enforcement: max row limit safety
    if (!query.limit || query.limit > 1000) {
      query.limit = 1000;
    }
    return query;
  }
};
