CameraStatus = function(){
  return {
    "bacpac/se": {
      "power": {
        "a": 18,
        "b": 20,
        "translate": {
          "00": "off",
          "01": "on"
        }
      }
    },
    "camera/se": {
      "batt1": {
        "a": 38,
        "b": 40,
        "translate": "_hexToDec"
      }
    },
    "camera/sx": { //the first 62 bytes of sx are almost the same as se
      "mode": {
        "a": 2,
        "b": 4,
        "translate": {
          "00": "video",
          "01": "still",
          "02": "burst",
          "03": "timer",
          "07": "settings"
        }
      },
      "fov": {
        "a": 14,
        "b": 16,
        "translate": {
          "00": "170",
          "01": "127",
          "02": "90"
        }
      },
      "picres": {
        "a": 17,
        "b": 18,
        "translate": {
          "3": "5MP med",
          "6": "7MP med",
          "4": "7MP wide",
          "5": "12MP wide"
        }
      },
      "secselapsed": {
        "a": 26,
        "b": 30,
        "translate": "_hexToDec"
      },
      "orientation": {
        "a": 37,
        "b": 38,
        "translate": {
          "0": "up",
          "4": "down"
        }
      },
      "charging": {
        "a": 39,
        "b": 40,
        "translate": {
          "3": "no",
          "4": "yes"
        }
      },
      "mem": { // i really have no idea what this is
        "a": 42,
        "b": 46,
        "translate": "_hexToDec"
      },
      "npics": {
        "a": 46,
        "b": 50,
        "translate": "_hexToDec"
      },
      "minsremaining": {
        "a": 50,
        "b": 54,
        "translate": "_hexToDec"
      },
      "nvids": {
        "a": 54,
        "b": 58,
        "translate": "_hexToDec"
      },
      "record": {
        "a": 60,
        "b": 62,
        "translate": {
          "05": "on",
          "04": "off"
        }
      },
      "batt2": {
        "a": 90,
        "b": 92,
        "translate": "_hexToDec"
      },
      "vidres": {
        "a": 100,
        "b": 102,
        "translate": {
          "00": "WVGA",
          "01": "720p",
          "02": "960p",
          "03": "1080p",
          "04": "1440p",
          "05": "2.7K",
          "06": "2.7KCin",
          "07": "4K",
          "08": "4KCin"
        }
      },
      "fps": {
        "a": 102,
        "b": 104,
        "translate": {
          "00": "12",
          "01": "15",
          "02": "24",
          "03": "25",
          "04": "30",
          "05": "48",
          "06": "50",
          "07": "60",
          "08": "100",
          "09": "120",
          "10": "240"
        }
      }
    }
  }
}

module.exports = CameraStatus();