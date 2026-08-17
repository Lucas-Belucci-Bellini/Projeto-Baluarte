# Ecosystem — ARK Provider Discovery v1

## Resultado

O ARCA/ARK possui uma fronteira de dados suficientemente clara para ser tratado como **provider candidate**, mas ainda não como capability publicada no Mesh.

### Dados que o ARCA produz/normaliza

- eventos públicos de risco;
- proveniência da fonte;
- horário de observação/modificação;
- geometria de referência;
- severidade/nível de alerta declarado pela fonte;
- contexto histórico agregado de busca e resgate;
- avaliações operacionais internas com incerteza e validade.

Fontes documentadas incluem GDACS, USGS e históricos agregados do NPS. O ARCA mantém a origem e o horário dos sinais e deixa claro que não emite ordens oficiais nem despacha equipes.

## Fronteira de publicação

A futura capability do ecossistema deve usar somente dados explicitamente públicos/compartilháveis do domínio ARK.

Não publicar via Mesh:

- conversas privadas;
- localização de usuários;
- dados pessoais;
- tabelas operacionais privadas;
- credenciais;
- comandos de despacho;
- qualquer mecanismo que transforme uma consulta externa em ação operacional.

## Candidate capabilities

Estas são apenas candidatas, não registry entries:

- `ark.hazards.observe`
- `ark.hazards.search`
- `ark.source.provenance`

Payload conceitual mínimo:

```json
{
  "items": [
    {
      "source": "usgs|gdacs|authority",
      "source_event_id": "opaque-id",
      "observed_at_utc": "timestamp",
      "geometry": "GeoJSON geometry",
      "confidence": "declared|reviewed|estimated",
      "source_url": "source reference"
    }
  ],
  "provider": "ark",
  "capability": "ark.hazards.observe",
  "provenance": []
}
```

## Consumer status

Nenhum dos cinco outros projetos foi comprovado nesta rodada como consumidor real dessas informações. Portanto, **não criar capability registry, grants ou requests para ARK ainda**.

O fato de ARK ter dados úteis não é suficiente; precisamos de um consumidor real e de uma interface de consumo real.

## Próximo passo

1. Mapear no AEGIS se existe uma implementação real capaz de consumir uma fonte/evento ARK sob contrato.
2. Mapear no Baluarte se algum serviço existente já consome eventos externos e pode servir como infraestrutura, sem virar dono do domínio ARK.
3. Se aparecer consumidor + provider + interface, escolher o menor caso e somente então criar o primeiro fluxo físico do Mesh.

## Segurança

O Mesh deve expor capacidades de leitura com mínimo privilégio. O domínio ARCA continua responsável por suas próprias autorizações e pelo limite humano-operacional. Uma capability externa não deve permitir despacho, emissão de alerta oficial ou acesso a dados privados.

## Continuidade

Este documento complementa `docs/ECOSYSTEM-CONTINUATION-STATE.md`. Próximo alvo oficial: **AEGIS implementation discovery → Baluarte platform primitives**.
