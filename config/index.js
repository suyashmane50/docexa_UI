const configs = {
  1: require("./clients/aashay_clinic.json"),
  2: require("./clients/suraj_clinic.json"),
  3: require("./clients/shree_clinic.json"),
};

const clientId = process.env.EXPO_PUBLIC_CLIENT_ID || "1";

module.exports = configs[clientId];
