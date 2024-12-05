# Beeceptor Intern Assignment

- Candidate Name: **Akshar Patel**
- Project: Creation of beeceptor's [http callout proxy](https://beeceptor.com/docs/proxy-rule-http-callout/#how-to-configure-a-proxy-rule) using playwright automation.

## Getting Started

1. Set the environment variable `BEECEPTOR_SESSION` with the cookie value.

![](./assets/cookie_info.png)

```bash
export BEECEPTOR_SESSION="besession_cookie_value" # bash
set -x BEECEPTOR_SESSION "besession_cookied_value" # fish
```

2. Fill in the callout proxy details in `beeceptor.config.ts` file.

> [!NOTE]
> No need to worry about typos, the config is validated both statically (using typescript lsp) and at runtime (using Zod)!

```typescript
export const beeceptorConfig: BeeceptorConfig = {
    endpoint: "myendpointname",
    calloutProxies: [
        {
            reqMethod: "GET",
            reqCondition: {
                reqCond: "Request path exactly matches",
                match: "/api/v1/users",
            },
            resType: "sync",
            resUrl: "https://google.com/" // <- usually this would be the URL of your server (webhook consumer) 
        },
        {
            reqMethod: "DELETE",
            reqCondition: {
                reqCond: "Request path exactly matches",
                match: "/api/v1/users",
            },
            resType: "async",
            resUrl: "https://google.com/"
        }
    ],
}
```

3. Make sure that playwright is installed [(read more)](https://playwright.dev/docs/intro)

```bash
npx playwright install
```

4. Install dependencies and start the dev server

```bash
npm install
npm run dev
```

A browser will open up and you will see the playwright automation in action.

## Scope of the project
- This project demonstrates creation of http callout proxy using playwright.
- It does not cover all the fields and validations.
- It does not maintain any local state to sync with the remote state.