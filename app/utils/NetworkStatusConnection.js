import NetInfo from "@react-native-community/netinfo";

export const netStatus = (callback) => {

  callback(true);
  /*NetInfo.isConnected.fetch().then(isConnected => {
    callback(isConnected);
  });*/
};

export const netStatusEvent = (callback) => {
  callback(true);
  /*NetInfo.isConnected.addEventListener("connectionChange", status => {
    callback(status);
  });*/
};
