const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain } = require('electron')
const util = require('util')
const fs = require('fs')

// listen for files event by browser process
const stat = util.promisify(fs.stat)

// crypto utils
const crypto = require('crypto');

function generateChecksum(str, algorithm, encoding) {
  return crypto
      .createHash(algorithm || 'sha256')
      .update(str, 'utf8')
      .digest(encoding || 'hex');
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 500,
    webPreferences:{
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // comunication with renderer processes
  ipcMain.on('files',async (event,fileArr) => {

    //console.log('filearr',fileArr)
    try {
        //synchronously get the data for all the files
        var data = await Promise.all(
          fileArr.map(async({ name, pathName }) => ({
            //...await stat(pathName),
            name,
            pathName
          }))
        )

        for (var i=0 in data){
          fs.readFile(pathNamex=data[i].pathName,function(err, datax) {
            var checksum_md4 = generateChecksum(datax,'md4');
            data[i].md4= checksum_md4.toString()
            var checksum_md5 = generateChecksum(datax,'md5');
            data[i].md5= checksum_md5.toString()  
            var checksum_sha1 = generateChecksum(datax,'sha1');
            data[i].sha1= checksum_sha1.toString()
            var checksum_sha256 = generateChecksum(datax,'sha256');
            data[i].sha256= checksum_sha256.toString()
            //var checksum_sha512 = generateChecksum(datax,'sha512');
            //data[i].sha512= checksum_sha512.toString()
            //double sha256 
            var checksum_sha256_2 = generateChecksum(checksum_sha256,'sha256');
            data[i].sha256_2= checksum_sha256_2.toString()

              
              mainWindow.webContents.send('metadata', data)
            })
        }
        
    } catch (error) {
      mainWindow.webContents.send('metadata:error', error)
    }
  })

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




