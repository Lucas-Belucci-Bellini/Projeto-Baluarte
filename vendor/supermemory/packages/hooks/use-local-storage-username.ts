import * as React from "react"

/**
 * `username` / `userName` keys written by the app. Populated only after mount so
 * server HTML and the first client render stay aligned (no hydration mismatch).
 */
export function useLocalStorageUsername(): string {
	const [value, setValue] = React.useState("")

	React.useEffect(() => {
		setValue(
			localStorage.getItem("username") ??
				localStorage.getItem("userName") ??
				"",
		)
	}, [])

	return value
}
