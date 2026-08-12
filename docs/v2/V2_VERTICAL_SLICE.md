# V2 — Primeiro vertical slice

Registry -> Runtime authorization -> Runtime session -> init -> start -> RUNNING -> stop -> dispose -> Runtime close.

Um módulo só entra em running depois de abrir seu Runtime. Falha durante init ou start fecha o Runtime. O transporte continua injetável e este slice não escolhe IPC.
