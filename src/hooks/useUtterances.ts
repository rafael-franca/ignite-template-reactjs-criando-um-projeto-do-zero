import { useEffect } from 'react';

const REPO_NAME = 'rafael-franca/ignite-template-reactjs-criando-um-projeto-do-zero'

export const useUtterances = (commentNodeId: string) => {
	useEffect(() => {
		const scriptParentNode = document.getElementById(commentNodeId)
		if (!scriptParentNode) return

		const script = document.createElement('script')
		script.src = 'https://utteranc.es/client.js'
		script.async = true
		script.setAttribute('repo', REPO_NAME)
		script.setAttribute('issue-term', 'pathname')
		script.setAttribute('label', 'comment :speech_balloon:')
		script.setAttribute('theme', 'photon-dark')
		script.setAttribute('crossorigin', 'anonymous')

		scriptParentNode.appendChild(script)

		return () => {
			scriptParentNode.removeChild(scriptParentNode.firstChild as Node)
		}
	}, [commentNodeId])
}