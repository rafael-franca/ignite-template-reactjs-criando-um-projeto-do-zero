import React from 'react'
import Link from 'next/link'

interface ExitPreviewProps {
    preview: boolean;
}

export default function ExitPreviewButton({ preview }: ExitPreviewProps) {
    if (!preview) return '';

    return (
        <aside>
            <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
            </Link>
        </aside>
    )
}