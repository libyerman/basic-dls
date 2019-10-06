module.exports = exports = {
    "global": {
        "automatic-hostname-type": 1,
        "busy-when-dialling-enabled": true,
        "Canonical-dialing-dial-needs-access-code": 0,
        "Canonical-dialing-international-prefix": 00,
        "Canonical-dialing-local-area-code": xxx,
        "Canonical-dialing-local-country-code": 49,
        "Canonical-dialing-min-local-number-length": 3,
        "Canonical-dialing-national-prefix": 0,
        "country-iso": "DE",
        "daylight-save": true,
        "auto-daylight-save": true,
        "daylight-save-zone-id": 9,
        "ip-protocol-mode": 0,
        "language-iso": "de",
        "realm": "fritz.box",
        "refuse-call": false,
        "reg-addr": "192.168.2.1",
        "registrar-addr": "192.168.2.1",
        "rtp-base-port": 5004,
        "server-type": 0,
        "session-duration": 3600,
        "session-timer": true,
        "non-rfc5746-tls-renegotiation": true,
        "sntp-tz-offset": 60,
        "remote-trace-user-notify": false,
        "use-display-id": true,
        "backup-registration": false,
        "locked-local-function-menus": { // lock changing user pw
            "2": true
        },
        "admin-pwd": "xxxxx",
        "user-pwd-hash": "b512d97e7cbf97c273e4db073bbb547aa65a84589227f8f3d9e4a72b9372a24d", // delete user pwd
        "pwd-retries": 0,
        "admin-pwd-status": 0 // reenable admin pwd
    },
    "device": {
        "00:1a:e8:02:5b:18": require("./setting11.js"), // Kino
        "00:1a:e8:03:53:d8": require("./setting12.js"), // Garagenkeller

        "00:1a:e8:3f:fc:64": require("./setting21.js"), // Wohnen
        "00:1a:e8:65:03:f4": require("./setting22.js"), // Essen
        "00:1a:e8:02:c8:9c": require("./setting23.js"), // Büro

        "00:1a:e8:38:af:e6": require("./setting31.js"), // Alex
        "00:1a:e8:39:c9:3b": require("./setting32.js"), // Maxi
        "00:1a:e8:2f:89:ab": require("./setting33.js"), // Christian
        "00:1a:e8:0c:34:fc": require("./setting34.js"), // Schlafen

        "00:1a:e8:0c:a3:b8": require("./setting41.js"),
    }
}
