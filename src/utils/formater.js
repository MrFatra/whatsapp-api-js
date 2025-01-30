const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
};

const formatPhoneNumber = (number) => {
  if (/^0/.test(number)) {
    return `62${number.slice(1)}@c.us`;
  }
  return number.endsWith("@c.us") ? number : `${number}@c.us`;
};

module.exports = { formatDate, formatPhoneNumber };
