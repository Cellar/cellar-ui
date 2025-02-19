import Button from "./Button";
import classes from "./NewButton.module.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Lock } from "src/components/characters/Lock";

export const NewSecretButton: React.FC = () => {
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
  );
};
