import { CreateSecretForm } from "../components/CreateSecretForm";
import { Layout } from "../layouts/Layout";
import Button from "../components/Button";
import React from "react";

export const CreateSecret = () => {
  return (
    <Layout>
      <h1>Create a Secret</h1>
      <Button appearance={Button.appearances.round}>🔒 New Secret</Button>
      <CreateSecretForm />
    </Layout>
  );
}

