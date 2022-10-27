import {RingRestClient} from "ring-client-api/lib/api/rest-client";
import {requestInput} from "ring-client-api/lib/api/util";
import {AuthTokenResponse} from "ring-client-api";
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.email || !process.env.password) {
    console.log("Required config email and password");
    process.exit(1);
}

export async function acquireRefreshToken() {
    const email = process.env.email as string;
    const password = process.env.password as string;

    const restClient = new RingRestClient({ email, password });

    async function getAuthWith2fa(): Promise<any> {
        const code = await requestInput('2fa Code: ')
        try {
            return await restClient.getAuth(code)
        } catch (_) {
            console.log('Incorrect 2fa code. Please try again.')
            return getAuthWith2fa()
        }
    }

    const auth: AuthTokenResponse = await restClient.getCurrentAuth().catch((e) => {
        if (restClient.promptFor2fa) {
            console.log(restClient.promptFor2fa)
            return getAuthWith2fa()
        }

        console.error(e)
        process.exit(1)
    });

    return auth.refresh_token
}
