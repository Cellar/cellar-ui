import {useState} from 'react'

import Button from '../Button'
import {Form, TextArea} from '../Form'

export const AccessSecretDisplay = () => {
  const dummySecret = `Jon Doe

  123 Maple Street
  Apt 4B
  Springfield, IL 62704
  United States`

  const [secretContent, setSecretContent] = useState(dummySecret)

  function handleCopySecret() {
    console.log('TODO copy secret') // TODO: copy secret to clipboard
  }

  return (
    <div>
      <Form>
        <TextArea
          readOnly={true}
          value={secretContent}
          rows={13}
          required/>
        <br />
        <div>
          <Button appearance={Button.appearances.primary} data-text="Copy Secret" onClick={handleCopySecret}>
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  )
}
