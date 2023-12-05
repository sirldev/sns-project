const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const prompt = require('custom-electron-prompt')
const socket = require('socket.io')
const express = require('express');
const http = require('http');
const e = require("express");
const {Server} = require("socket.io");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800, height: 600, webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


let connectIp = "127.0.0.1"
let connectPort = "4500"
let servePort = "4500"
let author = "사용자"

ipcMain.on("ipBtnClick", (event, args) => {
    console.log(args)
    prompt({
        title: 'IP Input', label: 'IP:', value: connectIp, inputAttrs: {
            type: 'text'
        }, type: 'input'
    })
        .then((r) => {
            if (r === null) {
                console.log('user cancelled');
            } else {
                connectIp = r
                console.log('result', r);
            }
        })
        .catch(console.error);
})

ipcMain.on("connectPortBtn", (event, args) => {
    console.log(args)
    prompt({
        title: 'Port Input', label: 'Port:', value: connectPort, inputAttrs: {
            type: 'number'
        }, type: 'input'
    })
        .then((r) => {
            if (r === null) {
                console.log('user cancelled');
            } else {
                connectPort = r
            }
        })
        .catch(console.error);
})

ipcMain.on("serveBtnClick", (event, args) => {
    const app = express();

    const server = http.createServer(app);

    const {Server} = require("socket.io");
    const io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');
        const instanceId = socket.id;

        socket.on('joinRoom', function (data) {
            console.log(data);
            socket.join("1234");
        });

        socket.on('reqMsg', function (data) {
            console.log(data);
            socket.in("1234").emit('recMsg', {comment: data.comment + '\n', author: data.author});
        })

        socket.on('reqPosition', function (data) {
            console.log('oo', data.position);
            socket.in("1234").emit("recPosition", {position: data.position})
        })

        socket.on('reqClear', function () {
            socket.in("1234").emit("recClear", {})
        })
    });

    server.listen(servePort, () => {
        console.log(`listening on *:${servePort}`);
    });

    console.log('run')
})

ipcMain.on("authorBtnClick", (event, args) => {
    prompt({
        title: 'Author Input', label: 'Author:', value: author, inputAttrs: {
            type: 'text'
        }, type: 'input'
    })
        .then((r) => {
            if (r === null) {
                console.log('user cancelled');
            } else {
                author = r
            }
        })
        .catch(console.error);
})

ipcMain.on("portBtn", (event, args) => {
    prompt({
        title: 'Port Input', label: 'Port:', value: servePort, inputAttrs: {
            type: 'number'
        }, type: 'input'
    })
        .then((r) => {
            if (r === null) {
                console.log('user cancelled');
            } else {
                servePort = r
            }
        })
        .catch(console.error);
})

ipcMain.on('connect', (event, args) => {
    event.sender.send('author', author);
    event.sender.send('ip', connectIp + ":" + connectPort);
})

