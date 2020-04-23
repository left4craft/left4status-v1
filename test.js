const fetch = require('node-fetch');
console.log('running. sending first request in 1 minute');

setInterval(() => {
    let tps = 18 + Math.random() * 2.3; // 18.0 to 20.3
    console.log('sending: ' + tps);
    fetch('http://localhost:8080/api/updateServer/survival/?key=JpQsx99phfDHEUKFRRWDbEsD&player_count=0&players=&tps=' + tps)
        .then(res => res.json())
        .then(json => console.log(json));
}, 60000);