// Native
import { join } from 'path';
import { format } from 'url';
import net from 'net';

// Packages
import { BrowserWindow, app, ipcMain, IpcMainEvent } from 'electron';
import isDev from 'electron-is-dev';
import prepareNext from 'electron-next';

// Prepare the renderer once the app is ready
app.on('ready', async () => {
  await prepareNext('.');

  const mainWindow = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: false,
      preload: join(__dirname, 'preload.js'),
    },
  });

  mainWindow.maximize();
  mainWindow.show();

  const url = isDev
    ? 'http://localhost:8000/'
    : format({
        pathname: join(__dirname, '../out/index.html'),
        protocol: 'file:',
        slashes: true,
      });

  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on('window-all-closed', app.quit);

let socket: net.Socket;
let gIgnoreFirst = false;

ipcMain.on(
  'tcp-send',
  (
    _event: IpcMainEvent,
    request: {
      protocol: number;
      message: { [key: string]: any };
      required: string[];
    }
  ) => {
    if (socket) {
      if (gIgnoreFirst) {
        const jsonStr = JSON.stringify(request);
        const compatRequest = String.fromCharCode(jsonStr.length) + jsonStr;
        console.log('SENDING WITH LENGTH: ', compatRequest);
        socket.write(compatRequest + '\n');
        return;
      }

      console.log('SENDING:', request);
      socket.write(JSON.stringify(request) + '\n');
    }
  }
);

ipcMain.on(
  'tcp-connection',
  (
    event: IpcMainEvent,
    {
      host,
      port,
      encoding,
      ignoreFirst,
    }: {
      host: string;
      port: number;
      encoding: BufferEncoding;
      ignoreFirst: boolean;
    }
  ) => {
    gIgnoreFirst = ignoreFirst;

    socket = net.createConnection({ host, port });
    socket.setEncoding(encoding ?? 'utf8');

    socket.on('connect', () => {
      console.info('SOCKET INFO: TCP client connected. Options:', {
        host,
        port,
        encoding,
      });
      event.sender.send('tcp-connection', 'connect');
    });

    socket.on('error', (error) => {
      console.log(`SOCKET ERROR: ${error}`);
      event.sender.send('tcp-connection', 'error');
    });

    socket.on('end', () => {
      console.log(`SOCKET ENDED`);
      event.sender.send('tcp-connection', 'end');
    });

    socket.on('close', () => {
      console.log(`SOCKET ENDED`);
      event.sender.send('tcp-connection', 'end');
    });

    socket.on('data', (data) => {
      try {
        const response = JSON.parse(
          data.toString().substring(data.toString().indexOf('{'))
        );
        console.log('RECIEVED:', response);
        event.sender.send('tcp-recieve', response);
      } catch (error) {
        console.log('RECIEVED (RAW):', data);
        console.error('Error: response is not a valid JSON.', error);
      }
    });
  }
);

ipcMain.on('tcp-disconnect', (event: IpcMainEvent) => {
  socket.destroy();
  console.log(`DESCONECTADO DO SOCKET`);
});
