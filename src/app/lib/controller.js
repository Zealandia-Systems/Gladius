import Controller from '@zealandia-systems/gladius-controller';
import io from 'socket.io-client';

const controller = new Controller(io);

export default controller;
