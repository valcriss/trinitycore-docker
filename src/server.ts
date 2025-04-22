import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import authRoutes from './routes/Authentication';
import indexRoutes from './routes/Index';
import consoleHelper from './models/tools/ConsoleHelper';
import ProfileLoader from './models/profiles/ProfileLoader';
import IProfile from './models/profiles/IProfile';
import CommandRunner from './models/tools/CommandRunner';
import AppInitializer from './models/initializer/AppInitializer';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
const profile: IProfile = ProfileLoader.loadProfile();

app.use(express.static(path.join(__dirname, './public')));
app.use(express.json());
app.use('/api', authRoutes);
app.use('/', indexRoutes);

const authServerRunner = new CommandRunner(profile.getAuthServerBinary(), ["--config", profile.getAuthServerConfigurationPath()], '/app/server/bin');
const worldServerRunner = new CommandRunner(profile.getWorldServerBinary(), ["--config", profile.getWorldServerConfigurationPath()], '/app/server/bin');
const appInitializer = new AppInitializer(profile.getInitializer());

(async () => {

  consoleHelper.writeBox('TrinityCore Docker 1.0.0 [ ' + profile.getName() + ' ]');
  
  await appInitializer.initialize();

  consoleHelper.writeBox('Application Startup Complete');

  io.on('connection', (socket) => {
    socket.on('worldserver_input', (input) => {
      worldServerRunner.send(input);
    });
    socket.on('authserver_input', (input) => {
      authServerRunner.send(input);
    });

    socket.emit('authserver_state', {
      output: authServerRunner.getOutput(),
      running: authServerRunner.isRunning(),
      code: authServerRunner.getCode()
    });
    socket.emit('worldserver_state', {
      output: worldServerRunner.getOutput(),
      running: worldServerRunner.isRunning(),
      code: worldServerRunner.getCode()
    });
  });
  /*
  authServerRunner.start(() => {
    io.emit('authserver_state', {
      output: authServerRunner.getOutput(),
      running: authServerRunner.isRunning(),
      code: authServerRunner.getCode()
    });
  });

  worldServerRunner.start(() => {
    io.emit('worldserver_state', {
      output: worldServerRunner.getOutput(),
      running: worldServerRunner.isRunning(),
      code: worldServerRunner.getCode()
    });
  });
  */
  // Start the server
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();