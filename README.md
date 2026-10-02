# Puddle Games

A small games site with 240+ browser games, a Favorites and Continue playing row, themes, and a custom background. It is plain HTML, CSS and JavaScript. There is nothing to install.

## Features
- Thumbnail grid with search and categories, including a 2 Player category
- Favorites and Recently played, saved in the browser
- 7 themes, an animated starry background, and your own background picture (upload or link)
- Five games built in (Snake, Memory Match, Tic Tac Toe, Pong, Connect Four) plus embedded games

## Run it locally
Open `index.html` in a browser. Or serve the folder:

```bash
python3 -m http.server 8000
```

Then go to http://localhost:8000.

## Put it on GitHub Pages
1. Create a new repository on GitHub and upload everything in this folder.
2. Go to **Settings, then Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, pick `main` and `/ (root)`, then **Save**.
4. After a minute your site is live at `https://YOUR-NAME.github.io/REPO-NAME/`.

## Credits and notes
- Embedded games come from [OnlineGames.io](https://www.onlinegames.io/t/embeddable-games-for-websites/) (free publisher program) and [TwoPlayerGames.org](https://www.twoplayergames.org/) (`/embed/` pages).
- Settings and favorites use the browser's local storage.
