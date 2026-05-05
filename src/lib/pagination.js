// ============================================
// 📄 CURSOR-BASED PAGINATION UTILITY
// Handles millions of records without skip() lag
// ============================================

/**
 * Apply cursor-based pagination to a Mongoose query.
 *
 * @param {Model} Model - Mongoose model to query
 * @param {object} filter - MongoDB filter object
 * @param {object} options - Pagination options
 * @param {string} options.cursor - The _id of the last item from previous page (null for first page)
 * @param {number} options.limit - Number of items per page (default: 20)
 * @param {string} options.sortField - Field to sort by (default: '_id')
 * @param {number} options.sortOrder - 1 for ascending, -1 for descending (default: -1)
 * @param {string} options.populate - Optional populate string
 * @param {string} options.select - Optional field selection string
 *
 * @returns {{ items: Array, nextCursor: string|null, hasMore: boolean }}
 */
export async function cursorPaginate(Model, filter = {}, options = {}) {
  const {
    cursor = null,
    limit = 20,
    sortField = '_id',
    sortOrder = -1,
    populate = '',
    select = '',
  } = options;

  // Build the cursor filter
  const cursorFilter = { ...filter };
  if (cursor) {
    // For descending: get items with _id less than cursor
    // For ascending: get items with _id greater than cursor
    cursorFilter[sortField] = sortOrder === -1
      ? { ...cursorFilter[sortField], $lt: cursor }
      : { ...cursorFilter[sortField], $gt: cursor };
  }

  // Fetch one extra to check if there are more
  let query = Model.find(cursorFilter)
    .sort({ [sortField]: sortOrder })
    .limit(limit + 1);

  if (populate) query = query.populate(populate);
  if (select) query = query.select(select);

  const results = await query.lean();
  const hasMore = results.length > limit;
  const items = hasMore ? results.slice(0, limit) : results;
  const nextCursor = hasMore && items.length > 0
    ? items[items.length - 1][sortField]
    : null;

  return { items, nextCursor, hasMore };
}

/**
 * Traditional offset pagination (for backward compatibility).
 * Adds proper indexes guidance.
 *
 * @param {Model} Model
 * @param {object} filter
 * @param {object} options
 * @returns {{ items: Array, total: number, page: number, totalPages: number }}
 */
export async function offsetPaginate(Model, filter = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { _id: -1 },
    populate = '',
    select = '',
  } = options;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    (() => {
      let q = Model.find(filter).sort(sort).skip(skip).limit(limit);
      if (populate) q = q.populate(populate);
      if (select) q = q.select(select);
      return q.lean();
    })(),
    Model.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}
