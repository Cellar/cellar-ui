import { CreateSecretForm } from "../components/createSecret/CreateSecretForm";
import { Layout } from "../layouts/Layout";
import React from "react";

export const CreateSecret = () => {
  return (
    <Layout title="Create a Secret">
      <CreateSecretForm />
    </Layout>
  );
}

