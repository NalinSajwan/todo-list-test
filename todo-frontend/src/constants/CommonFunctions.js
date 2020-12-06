function copyObj(dataToCopy) {
  if (typeof dataToCopy === "object") {
    return JSON.parse(JSON.stringify(dataToCopy));
  } else {
    return dataToCopy;
  }
};

export const copyJSON = copyObj;