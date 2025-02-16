import Button from "src/components/buttons/Button";
import { Form, TextArea } from "src/components/form/Form";
import { useLoaderData } from "react-router-dom";
import { ISecret } from "@/models/secret";
import classes from "./AccessSecretDisplay.module.css";
import { useMediaQuery } from "@mantine/hooks";
import { CopyButton } from "src/components/buttons/CopyButton";

export const AccessSecretDisplay = () => {
  const { content: secretContent } = useLoaderData() as ISecret;
  const isMobile = useMediaQuery("(max-width: 1000px)");

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
          <CopyButton
            data-testid="copy-secret-button"
            appearance={Button.appearances.primary}
            text="Copy Secret"
            textToCopy={secretContent}
            confirmationText="Copied"
            showCheckmark={false}
          />
        </div>
      </Form>
    </div>
  );
};
