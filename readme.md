# Solar System Explorer

Hey there! Welcome to the Solar System Explorer - a cool 3D journey through our solar system made with Three.js. This project lets you spin around the Earth and gawk at the other planets moving around the Sun. We've got some neat textures, nifty animations, and it's all from our home planet's POV.

Big shoutout to the folks over at [SuboptimalEng's three-js-games](https://github.com/SuboptimalEng/three-js-games.git) for their awesome Three.js example.

Earth has company too: the Moon (true distance, tidally locked) plus the ISS and Hubble, with their models scaled up so you can spot them. Scroll to zoom in on them, or out to find the Moon.

Around them swarm all ~17,000 active satellites (blue: low orbit, green: medium, orange: geostationary), from a [CelesTrak](https://celestrak.org) snapshot. Refresh it with `node scripts/update-satellites.mjs`.

The Moon texture is from [Solar System Scope](https://www.solarsystemscope.com/textures/) (CC BY 4.0).

## Getting Started

To get this baby up and running on your machine, you'll need Node.js installed. Grab it, then run these commands:

```bash
# Install dependencies first
npm install

# To start seeing planets
npm run dev

# Ready to go live? Build it!
npm run build
```

## License

Shield: [![CC BY-NC-SA 4.0][cc-by-nc-sa-shield]][cc-by-nc-sa]

This work is licensed under a
[Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License][cc-by-nc-sa].

[![CC BY-NC-SA 4.0][cc-by-nc-sa-image]][cc-by-nc-sa]

[cc-by-nc-sa]: http://creativecommons.org/licenses/by-nc-sa/4.0/
[cc-by-nc-sa-image]: https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png
[cc-by-nc-sa-shield]: https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg
