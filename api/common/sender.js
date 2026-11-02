let Sender = {};

Sender.send = function (res, code, msg) {
  let data;
  if (code >= 300) {
    if (msg == null) {
      switch (code) {
        case 422:
          msg = "Unprocessable";
          break;
        case 403:
          msg = "Forbidden";
          break;
        case 404:
          msg = "Not Found";
          break;
        case 500:
          msg = "Internal Server Error";
          break;
      }
    }
    data = { success: false, errorMsg: msg };
    res.status(code);
  } else if (code >= 200) {
    data = { success: true };
    res.status(code);
  } else if (code) {
    res.status(code);
  }
  res.send(data);
};

module.exports = Sender;
