# Qronos Frontend

This is the UI frontend for Qronos.

It is built using [Vite](https://vitejs.dev) and [React](https://reactjs.org) with [Tailwind CSS](https://tailwindcss.com) for styling.

## Developer Installation

- Clone the repository
- [Install pnpm](https://pnpm.io/installation)
- Run `pnpm install`
- Run `pnpm run dev` to start the development server
- Open [http://localhost:4000](http://localhost:4000) in your browser

The steps above will start the development server, but you will need to start the API to interact with the frontend. See the [backend README](../backend/python/README.md) for instructions on how to start the API.

### Developer Notes:

Some handy VCSode extensions:

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- [PostCSS Language Support](https://marketplace.visualstudio.com/items?itemName=csstools.postcss)
- [Vite](https://marketplace.visualstudio.com/items?itemName=antfu.vite)

### Debugging in VSCode:

The included `launch.json` file is configured to run the development server in debug mode and will allow you to set breakpoints and still run the server at http://localhost:4000.

You can either run the server from command line first using `pnpm run dev` and then run the `chrome_frontend` configuration in the debugger, or you can run the `Webapp::Chrome` configuration which will start the server and attach the debugger.
