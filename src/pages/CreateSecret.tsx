import { CreateSecretForm } from "../components/CreateSecretForm";
import { Layout } from "../layouts/Layout";

export const CreateSecret = () => {
  return (
    <Layout>
      <h1>Create a Secret</h1>
      <CreateSecretForm />
    </Layout>
  );
}

