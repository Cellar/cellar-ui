import { ComponentPropsWithoutRef, FC, useState } from 'react'
import cx from 'classnames'

import classes from './Form.module.css'
import {stringify} from "querystring";

export const Form: FC<ComponentPropsWithoutRef<'form'>> = (props) => {
  const { className, ...rest } = props

  return (
    <form className={cx(classes.form, className)} {...rest} />
  )
}


interface InputWrapperProps extends
  ComponentPropsWithoutRef<'div'> {
  label?: string
}
export const InputWrapper: FC<InputWrapperProps> = (props) => {

  const { children, className, label, ...rest } = props

  return (
    <div className={cx(classes.inputWrapper, className)} {...rest} >
      {label && <label className={classes.label}>{label}</label>}
      {children}
    </div>
  )
}


interface TextAreaProps extends
  ComponentPropsWithoutRef<'textarea'> {
  label?: string
}

export const TextArea: FC<TextAreaProps> = (props) => {
  const { className, label, ...rest } = props

  return (
    <InputWrapper label={label}>
      <textarea className={cx(classes.input, classes.textArea, className)}  {...rest} />
    </InputWrapper>
  )

}

export const TextInput: FC<ComponentPropsWithoutRef<'input'>> = (props) => {
  const { className, ...rest } = props

  return (
    <InputWrapper>
      <input className={cx(classes.input, className)}  {...rest} />
    </InputWrapper>
  )
}

export const FormButton: FC<ComponentPropsWithoutRef<'button'>> = (props) => {
  const { children, className, ...rest } = props

  return (
    <button type='button' className={cx(classes.input, classes.formButton, className)} {...rest}>
      {children}
    </button>
  )
}


interface ToggleButtonProps extends ComponentPropsWithoutRef<'button'> {
  setParentState: React.Dispatch<React.SetStateAction<boolean>>
}

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
  const {setParentState, children, className} = props

  const [isOn, setIsOn] = useState(false)

  return (
    <FormButton className={cx(className, isOn && classes.toggled)} onClick={() => {
      setIsOn(!isOn)
      setParentState(!isOn)
    }}>
      {children}
    </FormButton>
  )
}

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps extends
  ComponentPropsWithoutRef<'select'> {
  items: DropdownItem[],
  selected: string,
}

export const DropDown: FC<DropdownProps> = (props) => {
  const { className, items, selected, ...rest} = props

  return (
    <select className={cx(classes.select, className)} value={selected} {...rest}>
      {items.map(({value, label}) => <option key={value} value={value}>{label}</option>)}
    </select>
  )
}
