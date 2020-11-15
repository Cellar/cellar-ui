# What is Cellar

Cellar is an application for sharing secrets in text form for a set period of time.

Cellar is very simple to use.
Enter your text and set an expiration.
Cellar will then generate an ID for your secret and securely encrypt and store it.
After the expiration you have set, the secret is automatically deleted.

## How is Cellar different?

Cellar was inspired by the popular [Private Bin][priv-bin] but has a few key differences.

The primary difference is that Cellar integrates with existing systems to securely handle secrets.
For example, it does not handle any encryption itself.
Rather, it relies on an existing encryption as a service platform to encrypt your text.
That way, you can 
Cellar also doesn't do any sort of polling for expiration.
Instead, it publishes each secret with a set expiration and relies on the datastore to remove expired data automatically.

## When should I use Cellar?

Cellar is a quick way to share secrets without the need to authenticate or manage access control.
It is a great option if you want quickly share information with someone without the need to create any kind of account.

For example, when your friend needs your address for a wedding invitation.
Or maybe your family in another country needs a code to pickup something you sent them.
Perhaps, your boss needs the password to a zip file you sent them.

These are all great uses of Cellar.
Because Cellar relies on data expiration, access count limits, and randomly generated IDs to restrict access,
you know that your data stayed safe in transit and is only available as long as you want it to be.

## What doesn't Cellar do?

Cellar is not intended to replace proper password manager or authenticated secret sharing practices.  
If you are looking to permanently share passwords or files, a password manager or a cloud provider may be a better option.

Cellar uses long, randomly generated IDs to access data without authentication or authorization.  
That means that anyone with the ID that can access your installation of Cellar can read your data.
So make sure to set proper expirations and access limits.

If my data is only hidden behind an ID, couldn't some just guess the ID?  
Theoretically, yes.
Since there is no authentication, anyone who has the right ID can get to the password.
_However_, the IDs are 32 bytes of randomly generated data.
That means there are approximately 6.334028666297328e+49 different IDs.

# Cellar UI

This repository contains the source for the cellar Web Interface.
(The documentation for API can be found [here][api]

## Getting started

The Cellar UI is a web frontend for interacting with Cellar.

## Deploying

### Cellar UI

The UI itself can be deployed from minified source or as a Docker image.
A .tgz archive containing the latest minified source can be found on the [releases page][ui-releases].
The latest Docker image can be found in the [GitLab registry][ui-registry].

Alternatively you can build the UI yourself from source.
For more information on building the application, refer to the [contributing documentation][ui-contributing].

The Cellar UI depends on the [Cellar API][cellar-api].
Refer to the [Cellar API documentation][cellar-api] for more information.



[priv-bin]: https://github.com/PrivateBin/PrivateBin
[ui-releases]: https://gitlab.com/auroq/cellar/cellar-ui/-/releases
[ui-registry]: https://gitlab.com/auroq/cellar/cellar-ui/container_registry
[ui-contributing]: CONTRIBUTING.md
[api]: https://gitlab.com/auroq/cellar/cellar-api
