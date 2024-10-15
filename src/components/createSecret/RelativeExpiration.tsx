import classes from "./CreateSecretForm.module.css";
import {DropDown} from "../Form";
import {FC, useState} from "react";


const RelativeTimeUnits = {
  Hours: 'Hours',
  Minutes: 'Minutes',
}

export const RelativeExpiration: FC<{className?: string}> = ({className, ...props}) => {
  const [relativeTimeUnit, setRelativeTimeUnit] = useState(RelativeTimeUnits.Hours)
  const [relativeTimeValue, setRelativeTimeValue] = useState('24')

  return (
      <>
          <button className={classes.expirationMode}>Expires After (Relative)</button>
          <input
              value={relativeTimeValue}
              className={classes.expirationDropdown}
              type='number'
              onChange={(e) => setRelativeTimeValue(e.target.value)}
          />
          <DropDown
              className={classes.expirationInput}
              items={Object.values(RelativeTimeUnits).map(t => ({label: t, value: t}))}
              selected={relativeTimeUnit}
              onChange={(e) => setRelativeTimeUnit(e.target.value)}
          />
      </>
  )
}
