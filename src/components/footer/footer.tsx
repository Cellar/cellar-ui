import { Link } from "react-router-dom";
import classes from "./footer.module.css";
import { useLayoutEffect, useRef, useState } from "react";

export const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState("100vh");

  function updateHeight() {
    if (!footerRef.current) return;

    const siblings = Array.from(
      footerRef.current?.parentElement?.children || [],
    ).filter((el) => el !== footerRef.current);

    const totalHeight = siblings.reduce((acc, sibling) => {
      const { height } = sibling.getBoundingClientRect();
      return acc + height;
    }, 0);

    setMinHeight(`calc(100vh - ${totalHeight}px)`);
  }

  useLayoutEffect(() => {
    if (!footerRef.current) return;

    let timeoutId: number;

    function debouncedUpdateHeight() {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(updateHeight, 100);
    }

    const resizeObserver = new ResizeObserver(debouncedUpdateHeight);

    if (footerRef.current.parentElement) {
      resizeObserver.observe(footerRef.current.parentElement);
      debouncedUpdateHeight();
    }

    return () => {
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={footerRef}
      className={classes.footerContainer}
      style={{ minHeight }}
    >
      <div className={classes.footerContent}>
        <span className={classes.version} data-testid="footer-version">
          UI: v{__APP_VERSION__}
        </span>
        <Link
          className={classes.link}
          to={"https://cellar-app.io/"}
          target="_blank"
        >
          About Cellar
        </Link>
      </div>
    </div>
  );
};
