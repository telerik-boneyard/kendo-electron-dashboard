# Kendo UI Northwind Dashboard

<p>Kendo UI Northwind Dashboard is an Electron app built with Progress award-winning <a href="https://www.telerik.com/kendo-ui">Kendo UI HTML5 and JavaScript widgets</a>&mdash;70+ UI widgets to help you build responsive websites and apps fast.

Kendo UI<sup>&reg;</sup> offers components for every need&mdash;from the must-have for every app Grids, Dropdowns, and Menus to the advanced line-of-business UI, such as Charts, Gantt, Diagram, Scheduler, PivotGrid, and Maps.</p>

<p>The sample app showcases some of the most popular Kendo UI widgets, such as Scheduler, Grid, TabStrip, Charts, and Map in a real world scenario. It has a simple and responsive UI based on <a href="http://getbootstrap.com/">Bootstrap</a> and works on a wide range of devices.</p>
<p>The sample app is aimed at executives, analysts, or sales representatives. It helps them establish targets based on insights into historical data as well as track sales and product performance in real time.</p>

## Requirements

* [Kendo UI](https://www.telerik.com/kendo-ui)
* [Git](https://git-scm.com)
* [Node.js](https://nodejs.org/en/download/)

## Running This App

```bash
# Clone this repository
git clone https://github.com/telerik/kendo-electron-dashboard
# Go into the repository
cd kendo-electron-dashboard
# Install dependencies
npm install
# Run the app
npm start
```

## Distributing This App

Kendo UI Northwind Dashboard is configured to use the [Electron Packager](https://github.com/electron-userland/electron-packager) third-party packaging tool.

To create new builds, run the following commands in the terminal in the app folder:

```bash
#Install Electron packager for use in npm scripts
npm install electron-packager --save-dev
#Install Electron packager for use from cli
npm install electron-packager -g
#Create new build for the desired platform
npm run package-mac
npm run package-win
npm run package-linux
```
