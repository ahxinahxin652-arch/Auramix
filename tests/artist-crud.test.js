// Mock electron to allow running outside electron shell
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
  if (id === 'electron') {
    return {
      app: {
        isPackaged: false,
        getPath: (name) => {
          if (name === 'home') {
            const os = require('os');
            return os.homedir();
          }
          return __dirname;
        }
      }
    };
  }
  return originalRequire.apply(this, arguments);
};

const path = require('path');
const fs = require('fs');
const { initDatabase, autoMigrate, getDb, disconnectDatabase } = require('../server/dao/db');
const { nextId } = require('../server/dao/snowflake');

const testDbPath = path.join(__dirname, 'test-crud.db');
const testDbJournalPath = testDbPath + '-journal';

function cleanupDbFiles() {
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    if (fs.existsSync(testDbJournalPath)) fs.unlinkSync(testDbJournalPath);
  } catch (e) {
    console.warn('cleanup failed:', e.message);
  }
}

async function runTest() {
  cleanupDbFiles();
  initDatabase(testDbPath);
  await autoMigrate();
  const db = getDb();
  
  console.log('Testing Artist CRUD...');
  
  const artistId = nextId();
  const trackId = nextId();
  const albumId = nextId();
  const playlistId = nextId();
  const resourceId = nextId();
  let exitCode = 0;
  
  try {
    // 1. Create artist
    await db.artist.create({
      data: {
        id: artistId,
        name: 'Original Name',
        coverImg: null,
        bio: ''
      }
    });
    
    // 2. Create a mock album (required for Track.albumId NOT NULL)
    const album = await db.album.create({
      data: {
        id: albumId,
        title: 'Test Album',
        releaseDate: new Date(),
        albumType: 0
      }
    });

    // 2b. Create a playlist (warehouse)
    const playlist = await db.playlist.create({
      data: {
        id: playlistId,
        name: 'Test Playlist',
        ownerId: 1n,
        isPublic: 0
      }
    });
    
    // 3. Create a track bound to the album
    await db.track.create({
      data: {
        id: trackId,
        albumId: album.id,
        title: 'Test Track',
        duration: 180000,
        trackNumber: 1
      }
    });

    // 3b. Link the track to the playlist
    await db.playlistTrack.create({
      data: {
        playlistId: playlist.id,
        trackId: trackId,
        sortOrder: 0
      }
    });

    // Connect Track and Artist
    await db.trackArtist.create({
      data: {
        trackId: trackId,
        artistId: artistId,
        role: 0
      }
    });

    // Create audio resource
    await db.trackAudioResource.create({
      data: {
        id: resourceId,
        trackId: trackId,
        quality: 1,
        format: 0,
        bitrate: 320000,
        streamUrl: 'dummy/test.mp3',
        size: 1024n
      }
    });
    
    // 4. Perform update via service
    const musicService = require('../server/service/musicService');
    const updateResult = await musicService.updateArtist(artistId.toString(), {
      name: 'New Name',
      bio: 'New Bio'
    });
    
    if (!updateResult.success) {
      console.error('FAIL: Service update failed', updateResult.message || updateResult.error);
      exitCode = 1;
      return;
    }
    
    // 5. Verify name sync when resolving Track
    const musicDao = require('../server/dao/musicDao');
    const resolvedResult = await musicDao.resolveTrackById(trackId.toString());
    if (!resolvedResult.success || !resolvedResult.track) {
      console.error('FAIL: Track resolve failed', resolvedResult.error);
      exitCode = 1;
      return;
    }
    
    const trackVO = resolvedResult.track;
    const boundArtists = JSON.parse(trackVO.artists);
    if (boundArtists[0].name !== 'New Name') {
      console.error('FAIL: Track artist name was not synchronized', trackVO.artists);
      exitCode = 1;
      return;
    }
    
    // 6. Verify artist details in db
    const updatedArtist = await db.artist.findUnique({ where: { id: artistId } });
    if (!updatedArtist || updatedArtist.name !== 'New Name' || updatedArtist.bio !== 'New Bio') {
      console.error('FAIL: Artist name or bio was not updated in db', updatedArtist);
      exitCode = 1;
      return;
    }
    
    console.log('PASS: Artist CRUD and sync works');
  } catch (e) {
    console.error('FAIL: Unexpected test run error', e.stack || e.message);
    exitCode = 1;
  } finally {
    await disconnectDatabase();
    cleanupDbFiles();
    process.exit(exitCode);
  }
}

runTest();
