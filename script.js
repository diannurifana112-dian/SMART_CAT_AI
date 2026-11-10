
const MQTT_URL = "wss://broker.emqx.io:8084/mqtt";

const TOPIC_CAT =
  "smartcat/uas-demo-2026/cat-detection-7319";

const TOPIC_WATER =
  "smartcat/uas-demo-2026/water";

const TOPIC_PUMP =
  "smartcat/uas-demo-2026/pump";

const TOPIC_COMMAND =
  "smartcat/uas-demo-2026/command";

const client = mqtt.connect(MQTT_URL, {
  clientId: "SmartCatWeb_" +
    Math.random().toString(16).slice(2, 10),
  clean: true,
  connectTimeout: 10000,
  reconnectPeriod: 3000
});

let waterSafe = false;

client.on("connect", function () {
  document.getElementById("connection").innerText =
    "ONLINE";

  client.subscribe([
    TOPIC_CAT,
    TOPIC_WATER,
    TOPIC_PUMP
  ]);

  document.getElementById("message").innerText =
    "Website terhubung ke broker MQTT.";
});

client.on("offline", function () {
  document.getElementById("connection").innerText =
    "OFFLINE";
});

client.on("error", function (error) {
  console.log("MQTT Error:", error);
});

client.on("message", function (topic, message) {
  const data = message.toString();

  if (topic === TOPIC_CAT) {
    document.getElementById("catStatus").innerText =
      data === "CAT" ? "🐱 Kucing terdeteksi" :
      "Bukan kucing";
  }

  if (topic === TOPIC_WATER) {
    document.getElementById("waterStatus").innerText =
      data;

    waterSafe = data === "CUKUP";
    updateButtons();
  }

  if (topic === TOPIC_PUMP) {
    document.getElementById("pumpStatus").innerText =
      data;
  }
});

function updateButtons() {
  const connected = client.connected;

  document.getElementById("onButton").disabled =
    !connected || !waterSafe;

  document.getElementById("offButton").disabled =
    !connected;
}

function controlPump(command) {
  if (!client.connected) {
    alert("Website belum terhubung!");
    return;
  }

  if (command === "ON" && !waterSafe) {
    alert("Pompa tidak dapat dinyalakan. Periksa air!");
    return;
  }

  client.publish(TOPIC_COMMAND, command);

  document.getElementById("message").innerText =
    "Perintah " + command + " dikirim ke ESP32.";
}
