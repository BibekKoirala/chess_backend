const WSMessage = (action, message, payload) => {
    return payload
      ? JSON.stringify({ action: action, message: message, payload: payload })
      : JSON.stringify({ action: action, message: message });
  };

module.exports = WSMessage