import classes from "./CreateSecretForm.module.css";
import {FlatSelect, FlatInput} from "../Form";
import {FC, useEffect, useState} from "react";
import cx from "classnames";
import {Time} from "../../helpers/time";
import {padNum} from "../../helpers/helpers";
import {useMediaQuery} from "@mantine/hooks";


const AMPM = {
  AM: 'AM',
  PM: 'PM',
}

const timeOptions = [
  '01:00', '01:30',
  '02:00', '02:30',
  '03:00', '03:30',
  '04:00', '04:30',
  '05:00', '05:30',
  '06:00', '06:30',
  '07:00', '07:30',
  '08:00', '08:30',
  '09:00', '09:30',
  '10:00', '10:30',
  '11:00', '11:30',
  '12:00', '12:30',
];

export const AbsoluteExpiration: FC<{expiration: Date, setExpiration: React.Dispatch<React.SetStateAction<Date>>, className?: string}> = ({expiration, setExpiration, className, ...props}) => {
  let tomorrow = new Date()
  tomorrow.setHours(24)

  const isTinyMobile = useMediaQuery('(max-width: 300px)');
  const [date, setDate] = useState<Date>(tomorrow)
  const [time, setTime] = useState<string>('12:00')
  const [amPm, setAmPm] = useState<string>(AMPM.AM)

  useEffect(() => {
    setDateTimeAndAmPm(expiration)
  }, [expiration]);

  function setDateTimeAndAmPm(newExpiration: Date) {
    let {date: newDate, time: newTime, amPm: newAmPm} = getAbsoluteParts(expiration)
    setDate(newDate)
    setTime(newTime)
    setAmPm(newAmPm)
  }

  function getAbsoluteParts(target: Date): {date: Date, time: string, amPm: string} {
    let hours = target.getHours()
    let minutes = target.getMinutes()
    if (minutes >= 0 && minutes < 15) {
      minutes = 0
    } else if (minutes >= 15 && minutes < 45) {
      minutes = 30
    } else { // minutes should round up the hour
      minutes = 0
      hours++
    }

    const time = Time.toString(hours % 12, minutes)
    const amPm = hours % 24 > 11 ? AMPM.PM : AMPM.AM
    const date = new Date(target.getTime())
    date.setHours(0, 0, 0, 0)

    return {date, time, amPm}
  }

  function getAbsoluteDate(newDate: string, newTime: string, newAmPm: string) {
    const [hour, minute] = Time.fromString(newTime);
    const [year, month, day] = (newDate.split('-').map(v => +v))
    let absoluteDate = new Date(year, month, day, 0, 0, 0, 0)
    if (newAmPm === AMPM.PM) {
      absoluteDate.setHours(hour + 12, minute, 0, 0);
    } else {
      absoluteDate.setHours(hour, minute, 0, 0);
    }

    return absoluteDate
  }

  function formatDateForParsing(date: Date | string): string {
    if (typeof date === 'string')
      date = new Date(date)
    return `${date.getFullYear()}-${padNum(date.getMonth(), 2)}-${padNum(date.getDate(), 2)}`
  }

  return (
    <>
      <button className={classes.expirationMode}>Expire On (Absolute)</button>
      {isTinyMobile && <br />}
      <FlatInput
        label={'date'}
        value={formatDateForParsing(date)}
        className={cx(classes.dateDropdown, classes.expirationInput)}
        type='date'
        min={formatDateForParsing(tomorrow)}
        onChange={(e) => {
          setExpiration(getAbsoluteDate(e.target.value, time, amPm))
        }}
      />
      <FlatSelect
        label={'time'}
        className={cx(classes.expirationInput, classes.timeDropdown)}
        items={Object.values(timeOptions).map(t => ({label: t, value: t}))}
        selected={time}
        onChange={(e) => {
          setExpiration(getAbsoluteDate(formatDateForParsing(date), e.target.value, amPm))
        }}
      />
      <FlatSelect
        label={'am/pm'}
        className={cx(classes.expirationInput, classes.amPmDropdown)}
        items={Object.values(AMPM).map(t => ({label: t, value: t}))}
        selected={amPm}
        onChange={(e) => {
          setExpiration(getAbsoluteDate(formatDateForParsing(date), time, e.target.value))
        }}
      />
    </>
  )
}
