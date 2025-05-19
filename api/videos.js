import fetch from 'node-fetch';

export default async function handler(req, res) {
	try {
		const response = await fetch(`https://api.vimeo.com/users/${process.env.USER_ID}/projects/${process.env.VIDEO_ID}/videos`, {
			headers: {
				'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
				'Content-Type': 'application/json'
			}
		});
		const data = await response.json();
		res.status(200).json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}