# scsearch
Custom SoundCloud search engine with custom player


## Files that matter


### config.js
Contains SoundCloud API key, required to access SoundCloud API.


### customplayer.html
Static (non-working) custom player used for testing styling


### customplayer.js
Contains all the code used and needed for the custom player to work

Functions:

**initPlayer(volume):**

* Initializes and displays global volume controls for any player on the page, with the default volume level set to *volume*.

**createPlayer(json):**

* Accepts a parsed JSON *track* object returned from the SoundCloud API as input, returns an HTML Element containing the custom player.
