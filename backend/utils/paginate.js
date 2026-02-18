/**
 * Helper phân trang
 */
function paginate(query, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  
  return {
    query: `${query} LIMIT ? OFFSET ?`,
    params: [parseInt(limit), offset],
    page: parseInt(page),
    limit: parseInt(limit)
  };
}

/**
 * Tính toán pagination metadata
 */
function getPaginationMeta(total, page, limit) {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };
}

module.exports = { paginate, getPaginationMeta };
