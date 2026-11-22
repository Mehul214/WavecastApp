/**
 * @format
 */

import { AppRegistry } from 'react-native';
import TrackPlayer from '@rntp/player';
import App from './App';
import { name as appName } from './app.json';

TrackPlayer.registerPlaybackSession(async () => {
  TrackPlayer.setupPlayer({
    contentType: 'speech',
  });
});

AppRegistry.registerComponent(appName, () => App);
