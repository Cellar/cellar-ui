import dayjs from "dayjs"
import {useMemo, useState} from 'react'

import Button from '../Button'
import {DropDown, Form, FormButton, TextArea, TextInput, ToggleButton} from '../Form'

import classes from './CreateSecretForm.module.css'
import {RelativeExpiration} from "./RelativeExpiration";
import {AbsoluteExpiration} from "./AbsoluteExpiration";

const ExpirationModes = {
  Absolute: 'Expire On (Absolute)',
  Relative: 'Expire After (Relative)',
}

export const CreateSecretForm = () => {
  const [secretContent, setSecretContent] = useState('')
  const [expirationMode, setExpirationMode] = useState(ExpirationModes.Relative)
  const [accessLimit, setAccessLimit] = useState(1)

  function handleSetAccessLimit(newLimit: number) {
    if (newLimit > 0)
      setAccessLimit(newLimit)
  }

  function handleCreateSecret() {
    //console.log({expirationMode, relativeTimeUnit, relativeTimeValue}) // TODO: make network request
    const secretId = "12345" // TODO: get back secret id from back end
    window.location.href =`/secret/${secretId}` // TODO: redirect using spa navigation function (graviger)
  }

  return (
    <div>
      <Form>
        <TextArea
          rows={13}
          placeholder="Enter Secret Content"
          onChange={e => setSecretContent(e.target.value)}
          required/>
        <div className={classes.formControls}>
          <div>
            <span className={classes.header}>Expiration</span>
            <div>
              <DropDown
                className={classes.expirationMode}
                items={Object.values(ExpirationModes).map(m => ({label: m, value: m}))}
                selected={expirationMode}
                onChange={(e) => setExpirationMode(e.target.value)}
              />
              {
                (expirationMode === ExpirationModes.Relative) && <RelativeExpiration />
              }
              {
                (expirationMode === ExpirationModes.Absolute) && <AbsoluteExpiration />
              }
            </div>
          </div>
          <div>
            <span className={classes.header}>Access Limit</span>
            <div className={classes.accessLimitElements}>
              <TextInput
                inputMode='numeric'
                value={accessLimit}
                className={classes.accessLimitInput}
                onChange={(e) => handleSetAccessLimit(+e.target.value)}/>
              <FormButton onClick={() => handleSetAccessLimit(accessLimit - 1)}>-</FormButton>
              <FormButton onClick={() => handleSetAccessLimit(accessLimit + 1)}>+</FormButton>
            </div>
          </div>
        </div>
        <div>
          <Button appearance={Button.appearances.primary} data-text="Create Secret" onClick={handleCreateSecret}>
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  )
}
