const WebSocket = require('ws');

// Connect to the WebSocket server (use your server IP address here)
const ws = new WebSocket('ws://pi-server.echohub.ie');

// Connection opened event
ws.on('open', function open() {
  console.log('Connected to the WebSocket server');

  // Send a message to the server (could be the initial handshake)
  ws.send(JSON.stringify({ message: 'Hello from Raspberry Pi!' }));
});

// Listen for messages from the server
ws.on('message', function incoming(data) {
  try {
    // Parse the incoming data as JSON
    const jsonData = JSON.parse(data);

    // Check if it has a 'command' key
    if (jsonData.command) {
      console.log('Executing command:', jsonData.command);

      // Execute the command received from the server
      const exec = require('child_process').exec;
      exec(jsonData.command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing command: ${error}`);

          // Send back the error as a JSON response
          ws.send(JSON.stringify({
            message: `Error executing command: ${error.message}`
          }));
          return;
        }

        // Send back the result as a JSON response
        ws.send(JSON.stringify({
          message: `Command output: ${stdout || stderr}`
        }));
      });
    } else {
      // Send back an error message if no valid command was provided
      ws.send(JSON.stringify({
        message: 'Invalid JSON object: no "command" key'
      }));
    }
  } catch (e) {
    console.error('Error parsing message:', e.message);

    // Send back an error if the message is not a valid JSON
    ws.send(JSON.stringify({
      message: 'Error parsing JSON'
    }));
  }
});

// Handle disconnection or errors
ws.on('close', function close() {
  console.log('Disconnected from WebSocket server');
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
});