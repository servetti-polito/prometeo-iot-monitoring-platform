// Base element to create a Gauge. Here panels about basic measurements can be set
import { useEffect, useState } from "react";
import measuresInfo from "../../assets/measures.json";

const url = {
  base: `https://${import.meta.env.VITE_APP_DOMAIN}/chart/`,
  dashboard: "d-solo/bdb8ca18-df79-4743-818a-ebc8123908e5/prometeo?orgId=1",
  boardId: "&var-boardId=",
  unitName: "&var-unitName=",
  avg: "&var-avg=",
  ts: "&var-ts=",
  panel: "&panelId=",
  kiosk: "&kiosk",
};

// avg=rt il ts=90m , in avg=3h ts=48h, in avg=24h ts=14d ,
// in avg=3d ts=6w, per avg=1w ts=12w punti, per avg=1M ts=12M

const avgToTimeSpan = {
  RT: {
    ts: "90m",
    ms: 5400000,
    offset: 1,
  },
  "3h": {
    ts: "48h",
    ms: 172800000,
    offset: 30,
  },
  "24h": {
    ts: "14d",
    ms: 1209600000,
    offset: 120,
  },
  "3d": {
    ts: "6w",
    ms: 3628800000,
    offset: 120,
  },
  "1w": {
    ts: "12w",
    ms: 7257600000,
    offset: 360,
  },
  "1M": {
    ts: "12M",
    ms: 31536000000,
    offset: 2880,
  },
};

const isSummer = () => {
  var today = new Date();

  var startSummer = new Date(today.getFullYear() + 1, 5, 21); // 5 represents june (0-based)
  var endSummer = new Date(today.getFullYear(), 8, 21); // 8 represents semptember (0-based)

  return today <= endSummer && today >= startSummer;
};

function calcUrl(measure, average) {
  let resUrl =
    url.base + url.dashboard + url.boardId + localStorage.getItem("boardID");

  resUrl += url.unitName + measuresInfo[measure].grafana.unitName;
  resUrl += url.avg;
  resUrl += average == "RT" ? average.toLowerCase() : average;
  resUrl += url.ts + avgToTimeSpan[average].ts;

  //panelId for summer temperature is 11, for winter temperature is 1
  if (measure == "T" && isSummer()) {
    resUrl += url.panel + measuresInfo[measure].grafana.panelIdSummer;
  } else {
    resUrl += url.panel + measuresInfo[measure].grafana.panelId;
  }

  return resUrl + url.kiosk;
}

export default function GraphFrame(props) {
  const [localUrl, setLocalUrl] = useState("");

  // removes grafana greyish background
  useEffect(() => {
    setLocalUrl(calcUrl(props.measure, props.time_span));
    var dashGraphElements = document.querySelectorAll('[id="dashGraph"]');
    dashGraphElements.forEach(function (iframe) {
      iframe.onload = function () {
        var iframeDocument = iframe.contentDocument;
        if (iframeDocument) {
          var bodyElement = iframeDocument.querySelector("body");
          if (bodyElement) {
            bodyElement.style.background = "white";
          }
        }
      };
    });
  }, []);

  useEffect(() => {
    const sendMessageToGrafana = () => {
      let iframe = document.getElementById('dashGraph');
      if (iframe != null) {
        const currentTime = Date.now();
        const from = currentTime - avgToTimeSpan[props.time_span].ms;
        const to = currentTime + avgToTimeSpan[props.time_span].offset * 60000;
        const message = {
          variables: [
            { key: "avg", 
              value: props.time_span == "RT" ? 
                props.time_span.toLowerCase() : props.time_span },
            { key: "ts", 
              value: avgToTimeSpan[props.time_span].ts }
          ],
          timeRange: { from: from, to: to }
        }
        iframe.contentWindow.postMessage(message, localUrl);
      }
    }
    if (localUrl != "") sendMessageToGrafana();
  }, [props.time_span]);

  return (
    <iframe
      title={props.measure + props.time_span}
      id="dashGraph"
      src={localUrl}
    />
  );
}
