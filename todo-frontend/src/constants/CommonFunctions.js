/**
 * Shallow copies json object.
 * @param {*} dataToCopy
 * @type object dataToCopy
 */
function copyObj(dataToCopy) {
  if (typeof dataToCopy === "object") {
    return JSON.parse(JSON.stringify(dataToCopy));
  } else {
    return dataToCopy;
  }
};

export const copyJSON = copyObj;