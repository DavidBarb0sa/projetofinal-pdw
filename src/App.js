import React from "react";
import Game from "./Game";
import GameTheme from "./GameTheme";

export default function App() {
  return React.createElement(
    GameTheme,
    null,
    React.createElement(Game)
  );
}
