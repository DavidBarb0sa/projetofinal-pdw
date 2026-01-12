import React, { useEffect, useState } from "react";
import { getPortugalWeather } from "./services/ipmaService";

export default function GameTheme(props) {
  const [theme, setTheme] = useState("sun");

  useEffect(() => {
    getPortugalWeather().then(setTheme);
  }, []);

  return React.createElement(
    "div",
    { className: `theme-${theme}` },
    props.children
  );
}
