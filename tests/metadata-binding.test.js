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

const testDbPath = path.join(__dirname, 'test-metadata.db');
const testDbJournalPath = testDbPath + '-journal';

function cleanupDbFiles() {
  try {
    if (fs.existsSync(testDbPath)) fs.unlinkSync(testDbPath);
    if (fs.existsSync(testDbJournalPath)) fs.unlinkSync(testDbJournalPath);
    const dummyFile = path.join(__dirname, 'dummy_test.mp3');
    if (fs.existsSync(dummyFile)) fs.unlinkSync(dummyFile);
  } catch (e) {
    console.warn('cleanup failed:', e.message);
  }
}

async function runTest() {
  cleanupDbFiles();
  initDatabase(testDbPath);
  await autoMigrate();
  const db = getDb();
  
  console.log('Testing Artist Metadata Parsing & Track Binding...');
  
  let exitCode = 0;
  
  try {
    const albumId = nextId();
    const playlistId = nextId();
    const trackId = nextId();
    const resourceId = nextId();
    const dummyFile = path.join(__dirname, 'dummy_test.mp3');
    fs.writeFileSync(dummyFile, 'dummy content');

    // 1. Create a mock album (required for Track.albumId NOT NULL)
    const album = await db.album.create({
      data: {
        id: albumId,
        title: 'Test Album',
        releaseDate: new Date(),
        albumType: 0
      }
    });

    // 1b. Create a playlist (warehouse)
    const playlist = await db.playlist.create({
      data: {
        id: playlistId,
        name: 'Test Playlist',
        ownerId: 1n,
        isPublic: 0
      }
    });
    
    // 2. Create track and audio resource
    await db.track.create({
      data: {
        id: trackId,
        albumId: album.id,
        title: 'Test Track',
        duration: 180000,
        trackNumber: 1
      }
    });

    await db.trackAudioResource.create({
      data: {
        id: resourceId,
        trackId: trackId,
        quality: 1,
        format: 0,
        bitrate: 320000,
        streamUrl: dummyFile,
        size: 1024n
      }
    });

    // 2b. Link the track to the playlist
    await db.playlistTrack.create({
      data: {
        playlistId: playlist.id,
        trackId: trackId,
        sortOrder: 0
      }
    });

    const musicDao = require('../server/dao/musicDao');
    const artistDao = require('../server/dao/artistDao');

    // 3. Parse and create artists using buildArtistsJson
    const artistsJsonStr = await musicDao.buildArtistsJson('Jay Chou / Jolin Tsai');
    const boundArtists = JSON.parse(artistsJsonStr);
    if (boundArtists.length !== 2) {
      console.error('FAIL: Expected 2 bound artists, got', boundArtists);
      exitCode = 1;
      return;
    }

    // 4. Verify the artists are created in artists table
    const artist1 = await db.artist.findFirst({ where: { name: 'Jay Chou' } });
    const artist2 = await db.artist.findFirst({ where: { name: 'Jolin Tsai' } });
    if (!artist1 || !artist2) {
      console.error('FAIL: Artists not created in database', artist1, artist2);
      exitCode = 1;
      return;
    }

    // Verify IDs in JSON match database IDs
    if (boundArtists[0].id.toString() !== artist1.id.toString() || boundArtists[1].id.toString() !== artist2.id.toString()) {
      console.error('FAIL: JSON artist IDs do not match database artist IDs', boundArtists, artist1, artist2);
      exitCode = 1;
      return;
    }

    // 5. Connect Track and Artists
    for (const item of boundArtists) {
      await db.trackArtist.create({
        data: {
          trackId: trackId,
          artistId: BigInt(item.id),
          role: 0
        }
      });
    }

    // 6. Verify resolveTrackById returns artists field
    const resolvedResult = await musicDao.resolveTrackById(trackId.toString());
    if (!resolvedResult.success || !resolvedResult.track || !resolvedResult.track.artists) {
      console.error('FAIL: resolveTrackById did not return artists field', resolvedResult);
      exitCode = 1;
      return;
    }

    const resolvedArtists = JSON.parse(resolvedResult.track.artists);
    if (resolvedArtists.length !== 2 || resolvedArtists[0].name !== 'Jay Chou') {
      console.error('FAIL: resolveTrackById artists content incorrect', resolvedResult.track.artists);
      exitCode = 1;
      return;
    }

    // 7. Verify getWarehouseTracksById returns artists field in Track instance
    const warehouseTracksResult = await musicDao.getWarehouseTracksById(playlist.id.toString());
    if (!warehouseTracksResult.success || !warehouseTracksResult.tracks || warehouseTracksResult.tracks.length === 0) {
      console.error('FAIL: getWarehouseTracksById failed', warehouseTracksResult);
      exitCode = 1;
      return;
    }

    const trackInstance = warehouseTracksResult.tracks[0];
    if (!trackInstance.artists) {
      console.error('FAIL: Track instance from getWarehouseTracksById does not contain artists', trackInstance);
      exitCode = 1;
      return;
    }

    const trackInstanceArtists = JSON.parse(trackInstance.artists);
    if (trackInstanceArtists.length !== 2 || trackInstanceArtists[0].name !== 'Jay Chou') {
      console.error('FAIL: Track instance artists content incorrect', trackInstance.artists);
      exitCode = 1;
      return;
    }

    console.log('PASS: Artist metadata parsing & track binding test passed');
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
