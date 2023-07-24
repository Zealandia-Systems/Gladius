import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('ipcRenderer', require('electron').ipcRenderer);
