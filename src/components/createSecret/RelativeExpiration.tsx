import classes from "./CreateSecretForm.module.css";
import {DropDown} from "../Form";
import {FC, useState} from "react";
import cx from "classnames";


export const RelativeExpiration: FC<{className?: string}> = ({className, ...props}) => {
  const [hourValue, setHourValue] = useState('24')
  const [minuteValue, setMinuteValue] = useState('000')

  return (
    <>
      <button className={classes.expirationMode}>Expires After (Relative)</button>
      <input
        value={hourValue}
        className={cx(classes.expirationInput, classes.hoursDropdown)}
        type='number'
        onChange={(e) => setHourValue(e.target.value)}
      />
      <input
        value={minuteValue}
        className={cx(classes.expirationInput, classes.minutesDropdown)}
        type='number'
        onChange={(e) => setMinuteValue(e.target.value)}
      />
    </>
  )
}
