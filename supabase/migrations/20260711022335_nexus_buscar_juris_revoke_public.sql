-- (recuperada do remoto — aplicada via MCP em 2026-07-11)
-- O revoke anterior não bastou: o EXECUTE vinha do grant implícito a PUBLIC
-- (default do Postgres). Remove da raiz e concede só a quem precisa.
revoke execute on function public.buscar_juris(uuid, vector, integer) from public;
revoke execute on function public.buscar_juris(uuid, vector, integer) from anon;
grant execute on function public.buscar_juris(uuid, vector, integer) to authenticated, service_role;

-- As nexus.* internas também não precisam de PUBLIC (defesa em profundidade;
-- as ingest_* públicas continuam como estão — o portão delas é a ingest_key).
revoke execute on function nexus.resolve_tenant(text, text) from public;
revoke execute on function nexus.is_member(uuid) from public;
