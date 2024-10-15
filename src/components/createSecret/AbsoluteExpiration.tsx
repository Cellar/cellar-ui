import classes from "./CreateSecretForm.module.css";
import {DropDown} from "../Form";
import {FC, useState} from "react";


const AMPM = {
  AM: 'AM',
  PM: 'PM',
}

const timeOptions = [
  ' 1:00', ' 1:30',
  ' 2:00', ' 2:30',
  ' 3:00', ' 3:30',
  ' 4:00', ' 4:30',
  ' 5:00', ' 5:30',
  ' 6:00', ' 6:30',
  ' 7:00', ' 7:30',
  ' 8:00', ' 8:30',
  ' 9:00', ' 9:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
];

export const AbsoluteExpiration: FC<{className?: string}> = ({className, ...props}) => {
  let tomorrow = new Date()
  tomorrow.setHours(24)

  const [date, setDate] = useState(formatDate(tomorrow))
  const [time, setTime] = useState('12:00')
  const [amPm, setAmPm] = useState(AMPM.AM)

  function padNum(num: number): string {
    return ('0' + num).slice(-2)
  }

  function formatDate(date: Date): string {
    return `${date.getFullYear()}-${padNum(date.getMonth())}-${padNum(date.getDate())}`
  }

  return (
    <>
      <input
        value={date}
        className={classes.expirationInput}
        type='date'
        min={formatDate(tomorrow)}
        onChange={(e) => setDate(e.target.value)}
      />
      <DropDown
        className={classes.expirationDropdown}
        items={Object.values(timeOptions).map(t => ({label: t, value: t}))}
        selected={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <DropDown
        className={classes.expirationDropdown}
        items={Object.values(AMPM).map(t => ({label: t, value: t}))}
        selected={amPm}
        onChange={(e) => setAmPm(e.target.value)}
      />
    </>
  )
}
