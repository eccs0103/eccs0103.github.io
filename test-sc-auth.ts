import { env } from "./environment/services/local-environment.js";

async function testAuth() {
	console.log("Reading env...");
	const clientId = env.soundcloudClientId;
	const clientSecret = env.soundcloudClientSecret;
	const refreshToken = env.soundcloudToken;

	console.log(`ClientID: ${clientId}`);
	console.log(`ClientSecret: ${clientSecret.substring(0, 5)}...`);
	console.log(`RefreshToken: ${refreshToken.substring(0, 5)}...`);

	const url = "https://api.soundcloud.com/oauth2/token";
	const body = new URLSearchParams({
		grant_type: "refresh_token",
		client_id: clientId,
		client_secret: clientSecret,
		refresh_token: refreshToken,
		redirect_uri: "http://localhost:3000/callback"
	});

	console.log("Sending request...");
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: body
	});

	const text = await response.text();
	console.log(`Status: ${response.status}`);
	console.log(`Body: ${text}`);
}

testAuth();
