const calculateMetadata = async (model, query, page = 1, limit = 10) => {
    const totalItems = await model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;
    
    return {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      skip,
    };
  };
  
  module.exports = calculateMetadata;
  