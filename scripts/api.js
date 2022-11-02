const soket = new WebSocket("ws://185.246.65.199:8888/");

const getTokenMessage = {
  operation: "getToken",
};
soket.onopen = () => {
  soket.send(JSON.stringify(getTokenMessage));
};

let token = null;
let dataList = [];
let locationsList = [];

const updateToken = (tokenTemp) => {
  if (!tokenTemp) return console.log(token);
  return (token = tokenTemp);
};

const updateData = (data) => {
  dataList = data;
  return data;
};

const updateLocations = (locations) => {
  locationsList = locations;
  return locationsList;
};

soket.onmessage = (e) => {
  const recievedDataTemp = e.data;
  const recievedData = JSON.parse(recievedDataTemp);
  const action = recievedData.operation;
  switch (action) {
    case "token":
      token = recievedData.token;
      return updateToken(recievedData.token);
    case "dataList":
      updateData(recievedData.data);
    case "locationsList":
      updateLocations(recievedData.data);
    default:
      break;
  }
};

function Api() {
  const authCheker = (request) => {
    return (...args) => {
      if (!token) {
        return this.getAccessToken();
      }
      try {
        return request(...args);
      } catch (error) {
        console.log(error);
      }
    };
  };

  this.getAccessToken = () => {
    if (!token) return;
    return token;
  };

  this.getData = authCheker(() => {
    soket.send(JSON.stringify({ operation: "getData", token: token }));
    return dataList;
  });

  this.getLocations = authCheker(() => {
    soket.send(JSON.stringify({ token: token, operation: "getLocations" }));
    return locationsList;
  });

  this.addData = authCheker((name, inputLocation, status, comment) => {
    soket.send(
      JSON.stringify({
        operation: "addData",
        token,
        name,
        inputLocation,
        status,
        comment,
      })
    );
  });

  this.addLocation = authCheker((name) => {
    soket.send(
      JSON.stringify({
        operation: "addLocation",
        token,
        name,
      })
    );
  });

  this.editName = authCheker((id, name) => {
    soket.send(
      JSON.stringify({
        operation: "editName",
        token,
        id,
        name,
      })
    );
    console.log(id, name);
  });

  this.editInputLocation = authCheker((id, inputLocation) => {
    soket.send(
      JSON.stringify({
        operation: "editInputLocation",
        token,
        id,
        inputLocation,
      })
    );
    console.log(id, inputLocation);
  });

  this.editStatus = authCheker((id, status) => {
    console.log(id, status);
    soket.send(JSON.stringify({ token, id, status, operation: "editStatus" }));
  });

  this.editComment = authCheker((id, comment) => {
    soket.send(
      JSON.stringify({
        operation: "editComment",
        token,
        id,
        comment,
      })
    );
    console.log(id, comment);
  });

  this.addType = authCheker((id, name) => {
    soket.send(
      JSON.stringify({
        operation: "addType",
        token,
        id,
        name,
      })
    );
  });

  this.deleteType = authCheker((id, type_id) => {
    soket.send(
      JSON.stringify({
        operation: "deleteType",
        token,
        id,
        type_id,
      })
    );
  });

  this.deleteLocation = authCheker((id) => {
    soket.send(
      JSON.stringify({
        operation: "deleteLocation",
        token,
        id,
      })
    );
  });
}

export default new Api();
