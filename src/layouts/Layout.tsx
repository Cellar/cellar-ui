import React, { ReactNode, useEffect, useRef, useState } from "react";

import { Header } from "../components/header/Header";

import classes from "./Layout.module.css";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { Lock } from "src/components/characters/Lock";

export const Layout: React.FC<{ title?: string; children: ReactNode }> = (
  props,
) => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [extraContentWidth, setExtraContentWidth] = useState(0);

  function getLockWidth(): number {
    const lock = document.getElementById("secret-create-lock");
    if (lock) {
      const lockStyles = window.getComputedStyle(lock);
      return +lockStyles.width.split("px")[0];
    }
    return 0;
  }

  function getGapWidth(): number {
    if (contentRef.current)
      return parseInt(getComputedStyle(contentRef.current).gap) || 8;
    return 8;
  }

  useEffect(() => {
    setExtraContentWidth(getGapWidth() + getLockWidth());
  }, [contentRef]);

  return (
    <div>
      <Header />
      <main className={classes.main}>
        {props.title && (
          <div className={classes.title}>
            <h1>{props.title}</h1>
            <div className={classes.shim} />
            <div ref={contentRef} className={classes.createButton}>
              <Button
                extracontentwidth={extraContentWidth}
                appearance={Button.appearances.round}
                onClick={() => navigate("/secret/create")}
              >
                <Lock id="secret-create-lock" className={classes.lockImg} />
                New Secret
              </Button>
            </div>
          </div>
        )}
        {props.children}
      </main>
      <Link
        className={classes.footer}
        to={"https://cellar-app.io/"}
        target="_blank"
      >
        About Cellar
      </Link>
    </div>
  );
};
