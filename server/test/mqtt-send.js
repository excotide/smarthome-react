// mqtt-send.js
import mqtt from 'mqtt';

const client = mqtt.connect('mqtts://48378e59b49d4cfeadc19503175e8732.s1.eu.hivemq.cloud', {
  port: 8883,
  username: 'excotide',
  password: 'Smarthome123'
});

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  const payload = {
    mq2_raw: 154,
    gas_status: 1,
    flame: 1,
    rain: 1,
    lux: 4.17
  };
  client.publish('arduino/sensors', JSON.stringify(payload), {}, (err) => {
    if (err) console.error('Publish error:', err);
    else console.log('Payload sent!');
    client.end();
  });
});