import { chromium, type Page } from "playwright";
import { beeceptorConfig, type BeeceptorConfig } from "./beeceptor.config";
import { z } from "zod";

async function login(page: Page) {
    const BEECEPTOR_SESSION = process.env.BEECEPTOR_SESSION;
    if (!BEECEPTOR_SESSION) {
        throw new Error("BEECEPTOR_SESSION is not set");
    }
    await page.context().addCookies([{
        name: 'beesession',
        value: BEECEPTOR_SESSION.trim(),
        domain: '.beeceptor.com',
        path: '/',
        secure: true,
    }]);
    await page.reload();
}

async function createCalloutProxy(page: Page, calloutproxy: BeeceptorConfig["calloutProxies"][number]) {
    try {
        // Request Type
        const methodSelect = await page.waitForSelector("select#matchMethod");
        await methodSelect.selectOption({ label: calloutproxy.reqMethod });
        await page.waitForTimeout(1000);

        // Request Conditions
        const reqCondSelect = await page.waitForSelector("select#pathOperator");
        await reqCondSelect.selectOption({ label: calloutproxy.reqCondition.reqCond });
        await page.waitForTimeout(1000);
        if (typeof calloutproxy.reqCondition.match === "string") {
            const ruleValue = await page.waitForSelector("input[name='ruleMatchValue']");
            await ruleValue.fill(calloutproxy.reqCondition.match);
        } else {
            const headerName = await page.waitForSelector("input[name='matchHeaderKey']");
            const headerValue = await page.waitForSelector("input[name='matchHeaderValue']");
            await headerName.fill(calloutproxy.reqCondition.match.http_header_name);
            await headerValue.fill(calloutproxy.reqCondition.match.http_header_val);
        }

        // Response Type
        const responseType = await page.waitForSelector("select#proxyEdit\\.behavior");
        if (calloutproxy.resType === "sync") {
            await responseType.selectOption({ value: "wait" });
        } else if (calloutproxy.resType === "async") {
            await responseType.selectOption({ value: "no-wait" });
        } else {
            throw new Error("Invalid response type");
        }

        // Response Url
        const targetUrl = await page.waitForSelector("input[name='targetEndpoint']");
        await targetUrl.fill(calloutproxy.resUrl);

        // Save Proxy
        const saveBtn = await page.waitForSelector("button:has-text('Save Proxy')");
        await saveBtn.click();
        await page.waitForTimeout(2000); // Wait for save to complete
    } catch (error) {
        console.error(`Error processing proxy: ${error}`);
        throw error;
    }
}

async function createCalloutProxies(page: Page) {
    for (const calloutproxy of beeceptorConfig.calloutProxies) {
        // Reset page
        await page.goto(`https://app.beeceptor.com/console/${beeceptorConfig.endpoint}`);

        // Brings callout proxy creation form
        const mockingRulesBtn = await page.waitForSelector("a:has-text('Mocking Rules')");
        await mockingRulesBtn.click();
        const additionalRulesBtn = await page.waitForSelector("button:has-text('Additional Rule Types')");
        await additionalRulesBtn.click();
        const createProxyCalloutBtn = await page.waitForSelector("a:has-text('Create Proxy or Callout')", { timeout: 50000 });
        await createProxyCalloutBtn.click();

        // Create callout proxy
        await createCalloutProxy(page, calloutproxy);
    }
}

function validateConfig(config: any) {
    const schema = z.object({
        endpoint: z.string().regex(/^[a-zA-Z][a-zA-Z0-9\-]{3,40}[a-zA-Z0-9]$/, {
            message: "The endpoint name should have at least 5 characters and made of alphabets. This will be used as subdomain. E.g. github, salesforce, myendpoint, etc",
        })
    });
    schema.parse(config);
}

async function main() {
    validateConfig(beeceptorConfig);
    const browser = await chromium.launch({ headless: false });

    // home page
    const page = await browser.newPage();
    await page.goto("https://beeceptor.com/");
    await login(page);

    // create callout proxy
    await createCalloutProxies(page);

    await browser.close();
}

main().catch(console.error);