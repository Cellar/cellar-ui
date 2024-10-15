import { CreateSecretForm } from "../components/createSecret/CreateSecretForm";
import { Layout } from "../layouts/Layout";
import React from "react";
import {AccessSecretDisplay} from "../components/accessSecret/AccessSecretDisplay";

export const AccessSecret = () => {
  return (
    <Layout title="The Secret">
      <AccessSecretDisplay />
    </Layout>
  );
}

