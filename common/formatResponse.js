const formatResponse = (success, data, message, metadata = {}) => {
    return {
      success,
      data,
      message,
      metadata,
    };
  };

  
  module.exports = formatResponse