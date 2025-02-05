import Button from "../Button";
import { Form, TextArea } from "../Form";
import { useLoaderData } from "react-router-dom";
import { ISecret } from "@/models/secret";
import classes from "./AccessSecretDisplay.module.css";
import { useMediaQuery } from "@mantine/hooks";

export const AccessSecretDisplay = () => {
  const { content: secretContent } = useLoaderData() as ISecret;
  const isMobile = useMediaQuery("(max-width: 1000px)");

  async function handleCopySecret() {
    await navigator.clipboard.writeText(secretContent);
  }

  return (
    <div>
      <Form data-testid="access-secret-form">
        <TextArea
          data-testid="secret-content"
          className={classes.secretContent}
          readOnly={true}
          value={secretContent}
          rows={isMobile ? 11 : 11}
          required
        />
        <div className={classes.formSection}>
          <Button
            data-testid="copy-secret-button"
            appearance={Button.appearances.primary}
            data-text="Copy Secret"
            onClick={handleCopySecret}
          >
            Create Secret
          </Button>
        </div>
      </Form>
    </div>
  );
};
