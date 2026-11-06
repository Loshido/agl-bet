import pg from "../../src/lib/pg"

const main = async () => {
	const client = await pg()

	const resp = await client.query("UPDATE utilisateurs SET roles = $1::jsonb WHERE pseudo = $2", [
		JSON.stringify(["root", "admin", "user"]),
		"livio"
	])

	console.log(resp.affectedRows)

	await client.close()
}

main()
