import dayjs from "dayjs"
import {useMemo, useState} from 'react'

import Button from './Button'
import {DropDown, Form, FormButton, TextArea, TextInput, ToggleButton} from './Form'

import classes from './CreateSecretForm.module.css'

const ExpirationModes = {
  Absolute: 'Absolute',
  Relative: 'Relative',
}

const RelativeTimeUnits = {
  Hours: 'Hours',
  Minutes: 'Minutes',
}

export const CreateSecretForm = () => {
  const minDate = useMemo(() => dayjs(new Date()).toDate(), [])
  const [expirationMode, setExpirationMode] = useState(ExpirationModes.Relative)
  const [relativeTimeUnit, setRelativeTimeUnit] = useState(RelativeTimeUnits.Hours)
  const [relativeTimeValue, setRelativeTimeValue] = useState('24')

  function handleCreateSecret() {
    console.log({expirationMode, relativeTimeUnit, relativeTimeValue}) // TODO: make network request
    const secretId = "12345" // TODO: get back secret id from back end
    window.location.href =`/secret/${secretId}` // TODO: redirect using spa navigation function (graviger)
  }

  return (
    <div>
      <Form>
        <TextArea rows={13} placeholder="Your secret is safe here" required />
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
                (expirationMode === ExpirationModes.Relative) && (
                  <>
                    <input
                      value={relativeTimeValue}
                      className={classes.relativeTimeValue}
                      type='number'
                      onChange={(e) => setRelativeTimeValue(e.target.value)}
                    />
                    <DropDown
                      className={classes.relativeTimeUnit}
                      items={Object.values(RelativeTimeUnits).map(t => ({label: t, value: t}))}
                      selected={relativeTimeUnit}
                      onChange={(e) => setRelativeTimeUnit(e.target.value)}
                    />
                  </>
                )
              }
              {
                (expirationMode === ExpirationModes.Absolute) && (
                  <div>Absolute</div>
                )
              }
            </div>
          </div>
          <div>
            <span className={classes.header}>Access Limit</span>
            <div className={classes.accessLimitElements}>
              <TextInput value='1' className={classes.accessLimitInput}/>
              <FormButton>-</FormButton>
              <FormButton>+</FormButton>
              <ToggleButton>Unlimited</ToggleButton>
            </div>
          </div>
          <div>
            <Button appearance={Button.appearances.primary} data-text="Create Secret" onClick={handleCreateSecret}>
              Create Secret
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}
