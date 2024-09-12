const url = "https://localhost:7182/";
// creating connection to signalR in ASP side :
const connection = new signalR.HubConnectionBuilder()
  .withUrl(url + "offers")
  .configureLogging(signalR.LogLevel.Information)
  .build();

async function start() {
  try {
    await connection.start(); // connecting to the hub
    console.log("signalR connected ...");
    $.get(url + "api/Offer", (data, status) => {
      // const element = document.querySelector("#offerValue");
      // element.textContent = "Begin price : $" + data;
      $("#offerValue").text(`Begin Price : $${data} .`);
    });
  } catch (error) {
    console.log(error);
    setTimeout(() => {
      start(); // connecting again after exception (after 5 seconds trying to connect again)
    }, 5000);
  }
}

start();

// subscribes to some method and waits for calling it :
connection.on("ReceiveConnectInfo", (message) => {
  const element = document.querySelector("#connectedUserInfo");
  // element.textContent += message;
});

connection.on("ReceiveDisconnectInfo", (message) => {
  const element = document.querySelector("#disconnectedUserInfo");
  // element.textContent += message;
});

connection.on("ReceiveMessage", (userMessage, offer) => {
  const offerResponse = document.querySelector("#offerResponseValue");
  offerResponse.textContent = userMessage + offer;
});

connection.on("ReceiveTimerSeconds", (seconds) => {
  const usernameInput = document.querySelector("#user");
  const timerElement = document.querySelector("#timer");
  const timer = setInterval(() => {
    if (seconds === 0) {
      clearInterval(timer);
      connection.invoke("ShowWinner", usernameInput.value);
    }
    timerElement.textContent = seconds;
    seconds -= 1;
  }, 1000);
});

connection.on("ShowWinnerForOthers", (userUsername) => {
  const winnerElement = document.querySelector("#winnerMessage");
  winnerElement.textContent = `${userUsername} is winner!`;
});

// connection.on("ShowWinnerForCaller", () => {
//   winnerElement.textContent = "You are winner congratulations !";
// });

connection.on("DisableButton", (seconds) => {
  const button = document.querySelector("#increaseOfferBtn");
  button.disabled = true;
  const timer = setInterval(() => {
    if (seconds === 0) {
      button.disabled = false;
      clearInterval(timer);
    }
    seconds -= 1;
  }, 1000);
});

const increaseOffer = () => {
  const user = document.querySelector("#user");
  $.get(url + "api/Offer/Increase?data=100", (data, status) => {
    $.get(url + "api/Offer", () => {
      connection.invoke("ShowTimer", 10);
      connection.invoke("SendMessage", user.value);
    });
  });
};
