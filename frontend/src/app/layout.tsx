// Esse é o layout da aplicação, vai encapsular todo o projeto.
// Tudo o que estiver dentro dele vai aparecer em todas as páginas. Ex: cabeçalho e rodapé.

import React from "react";

// Header -> logo do smart city - nome do user logado e botão de sair


// Sidebar -> links de navegação

// Main content -> onde o conteúdo central vai ser renderizado.

// src/app/layout.tsx
export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <main>{children}</main>
            </body>
        </html>
    )
}