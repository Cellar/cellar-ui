import dayjs from "dayjs"
import { useMemo } from 'react'

import { Button } from './Button'
import { Form, TextArea } from './Form'

export const CreateSecretForm = () => {
  const minDate = useMemo(() => dayjs(new Date()).toDate(), [])

  return (
    <div>
      <Form>
        <TextArea placeholder="Your secret is safe here" required />

        <Button>
          Create Secret
        </Button>
      </Form>
    </div>
  )
}
