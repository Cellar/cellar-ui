import { CreateSecretForm } from "../components/CreateSecretForm";
import { Layout } from "../layouts/Layout";
import Button from "../components/Button";
import React from "react";

export const CreateSecret = () => {
  return (
    <Layout title="Create a Secret">
      <CreateSecretForm />
    </Layout>
  );
}

