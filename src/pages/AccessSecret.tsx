import { Layout } from "../layouts/Layout";
import React from "react";
import {AccessSecretDisplay} from "../components/accessSecret/AccessSecretDisplay";
import {IApiError} from "../models/error";
import {accessSecret} from "../api/client";
import {ISecret} from "../models/secret";


export const AccessSecretLoader = async ({ params }: { params: any }): Promise<ISecret | IApiError>  => {
  const secretId = params.secretId;

  return accessSecret(secretId);
}

export const AccessSecret = () => {
  return (
    <Layout title="The Secret">
      <AccessSecretDisplay />
    </Layout>
  );
}

