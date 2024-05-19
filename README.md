# KeySound

A simple library that allows you to bind keyboard events to sound. It supports both sequential and parallel playback of sounds. The library is written in TypeScript and uses Web Audio API.

## Install

You can install the library via npm:

```
npm i key-sound
```

## Usage

This package can be used via CDN script tag to the `<head>` of your HTML file.

```html
<script src="../dist/bundle.umd.js"></script>
  <script>
    KeySound.setConfig({ parallelPlayback: true });
    KeySound.bind({ key: 'a', src: 'click.mp3' });
    KeySound.bind({ key: 's', src: 'click.mp3' });

    setTimeout(() => {
      KeySound.pause();
    }, 10000);
    setTimeout(() => {
      KeySound.resume();
    }, 20000);
  </script>
</script>
```

or import it on your module like

```js
import keysound from 'key-sound';

keysound.setConfig({ parallelPlayback: true });
keysound.bind({ key: 'a', src: 'click.mp3' });
keysound.bind({ key: 's', src: 'click2.mp3' });
keysound.unbind('s');
```

## API

| Method                                                  | Description                                                                                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| setConfig(config)                                       | Sets the config object. currently only `parallelPlayback` to enable click sound plays in parallel even before last sound of same key not finished |
| bind({ key: 's', src: 'click2.mp3', callback: ()=>{} }) | Binds a key-source pair or an array of key-source pairs to the bindings list.                                                                     |
| unbind(keys)                                            | Removes a binding for the given key from the list of bindings.                                                                                    |
| pause()                                                 | Pauses the playback of all sounds.                                                                                                                |
| resume()                                                | Resumes the playback of all sounds.                                                                                                               |
