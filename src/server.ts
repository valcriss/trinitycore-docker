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
import bootstrapTracker from './models/bootstrap/BootstrapTracker';

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

function emitBootstrapState() {
  io.emit('bootstrap_state', bootstrapTracker.getSnapshot());
}

function emitProcessState() {
  io.emit('authserver_state', {
    output: authServerRunner.getOutput(),
    running: authServerRunner.isRunning(),
    code: authServerRunner.getCode(),
    startedAt: authServerRunner.getStartedAt(),
    lastUpdatedAt: authServerRunner.getLastUpdatedAt()
  });
  io.emit('worldserver_state', {
    output: worldServerRunner.getOutput(),
    running: worldServerRunner.isRunning(),
    code: worldServerRunner.getCode(),
    startedAt: worldServerRunner.getStartedAt(),
    lastUpdatedAt: worldServerRunner.getLastUpdatedAt()
  });
}

bootstrapTracker.on('update', emitBootstrapState);

io.on('connection', (socket) => {
  socket.on('worldserver_input', (input) => {
    worldServerRunner.send(input);
  });
  socket.on('authserver_input', (input) => {
    authServerRunner.send(input);
  });

  socket.emit('bootstrap_state', bootstrapTracker.getSnapshot());
  socket.emit('authserver_state', {
    output: authServerRunner.getOutput(),
    running: authServerRunner.isRunning(),
    code: authServerRunner.getCode(),
    startedAt: authServerRunner.getStartedAt(),
    lastUpdatedAt: authServerRunner.getLastUpdatedAt()
  });
  socket.emit('worldserver_state', {
    output: worldServerRunner.getOutput(),
    running: worldServerRunner.isRunning(),
    code: worldServerRunner.getCode(),
    startedAt: worldServerRunner.getStartedAt(),
    lastUpdatedAt: worldServerRunner.getLastUpdatedAt()
  });
});

consoleHelper.writeBox('TrinityCore Docker 1.0.0 [ ' + profile.getName() + ' ]');
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

(async () => {
  emitBootstrapState();
  emitProcessState();

  if (!await appInitializer.initialize()) {
    return;
  }

  consoleHelper.writeBox('Application Startup Complete');

  authServerRunner.start(() => {
    emitProcessState();
  });

  worldServerRunner.start(() => {
    emitProcessState();
  });
})();
