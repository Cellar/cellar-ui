import {Button, NumberInput, Select, Textarea} from "@mantine/core";
import {DatePicker, TimeInput} from "@mantine/dates";
import dayjs from "dayjs"

export function CreateSecret() {
  return (
    <form>
      <Textarea
        placeholder="Your secret is safe here"
        label="Secret Content"
        required
      />
      <Select
        label="Expiration"
        placeholder="Pick one"
        data={[
          {value: 'absolute', label: 'Expire On (Absolute)'},
          {value: 'relative', label: 'Expires in (Relative)'},
        ]}
      />
      <DatePicker
        allowLevelChange={false}
        placeholder="No level change"
        minDate={dayjs(new Date()).toDate()}
        label="Date"
      />
      <TimeInput label="Time"/>
      <NumberInput
        defaultValue={1}
        placeholder="1"
        label="Access Limit"
        required
      />
      <Button
        type="submit">Create Secret
      </Button>
    </form>
  );
}
