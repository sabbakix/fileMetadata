const { ipcRenderer } = require("electron")

const submitListener = document
    .querySelector('form')
    .addEventListener('change',(event) => {
        //prevent default behavior that causes page refresh
        event.preventDefault()


        // an array of files with some metadata
        const files = [...document.getElementById('filePicker').files]

        //format the file data to only path and name
        const filesFormated = files.map( ({name,path:pathName}) => ({name,pathName}) )

        //console.log('filesFormated from renderer process',filesFormated)

        ipcRenderer.send('files',filesFormated)
    })

// metadata from the main process
ipcRenderer.on('metadata',(event,metadata) => {
    const pre = document.getElementById('data')
    pre.innerText = JSON.stringify(metadata,null,2)
})

// error event from catch block in main process
ipcRenderer.on('metadata:error',(event,error) => {
    console.error(error)
})