import classes from "./CreateSecretForm.module.css";
import { FC, useEffect, useState } from "react";
import cx from "classnames";
import { padNum } from "../../helpers/helpers";
import { useMediaQuery } from "@mantine/hooks";
import { FlatInput } from "../Form";

export const RelativeExpiration: FC<{
  expiration: Date;
  setExpiration: React.Dispatch<React.SetStateAction<Date>>;
  className?: string;
}> = ({ expiration, setExpiration, className, ...props }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const isTinyMobile = useMediaQuery("(max-width: 393px)");

  useEffect(() => {
    setHoursAndMinutes(expiration);
  }, [expiration]);

  function setHoursAndMinutes(newExpiration: Date) {
    const { hours: newHours, minutes: newMinutes } = getRelative(newExpiration);
    setHours(newHours);
    setMinutes(newMinutes);
  }

  function getAbsoluteDate(hours: number, minutes: number) {
    let newDate = new Date();
    newDate.setHours(
      newDate.getHours() + hours,
      newDate.getMinutes() + minutes,
      0,
      0,
    );

    return newDate;
  }

  function getRelative(target: Date): { hours: number; minutes: number } {
    let diff = target.getTime() - Date.now();
    let hours = Math.floor(diff / (1000 * 60 * 60));
    let minutes = Math.ceil((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (minutes >= 60) {
      hours++;
      minutes = minutes % 60;
    }

    return { hours, minutes };
  }

  return (
    <>
      <button className={classes.expirationMode}>
        Expire After (Relative)
      </button>
      {isTinyMobile && <br />}
      <FlatInput
        label={"hours"}
        value={padNum(hours, 3)}
        className={cx(classes.expirationInput, classes.hoursDropdown)}
        type="number"
        min={minutes >= 30 ? 0 : 1}
        onChange={(e) => {
          setExpiration(getAbsoluteDate(+e.target.value, minutes));
        }}
      />
      <FlatInput
        label={"minutes"}
        value={padNum(minutes, 3)}
        className={cx(classes.expirationInput, classes.minutesDropdown)}
        type="number"
        min={hours >= 1 ? 0 : 30}
        onChange={(e) => {
          setExpiration(getAbsoluteDate(hours, +e.target.value));
        }}
      />
    </>
  );
};
