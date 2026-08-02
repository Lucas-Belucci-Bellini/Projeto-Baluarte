// Dump do MANUAL DE CAMPO - CfgHints.
//
// Cole no debug console do Arma 3 com todos os DLCs carregados. Depois:
//     python scripts/arma3/parse-manual.py
//
// O que sai: o Field Manual do jogo inteiro - todas as categorias e topicos, com
// titulo, texto e imagem. E conteudo didatico escrito pela Bohemia sobre como o
// jogo funciona: comandos de esquadrao, balistica, navegacao, sinalizacao,
// veiculos, primeiros socorros.
//
// A tela de tutorial hoje tem 42 topicos escritos a mao. Isto traz a fonte
// oficial, com atribuicao.
//
// ATENCAO A LICENCA: o texto e da Bohemia Interactive. A base guarda para
// CONSULTA e o site precisa creditar - igual ao que ja se faz com a Wikipedia
// no Centro Militar. Nao e conteudo do projeto e nao deve ser apresentado como
// se fosse.
//
// FORMATO - texto picado de proposito (o diag_log corta em 1012):
//     C |categoria|nome
//     H |id|categoria|classe|titulo|imagem
//     HT|id|<texto em pedacos de 700>
//     HA|id|<argumentos em pedacos>     (as teclas citadas no texto)
//     PLACAR|categorias|topicos

private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_pedacos = {
    params ["_marca", "_id", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3MANUAL>>%1|%2|%3", _marca, _id, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3MANUAL>>INICIO|v1";

private _nCats = 0;
private _nTopicos = 0;

{
    private _cfgCat = _x;
    private _categoria = configName _cfgCat;
    _nCats = _nCats + 1;

    diag_log text (format ["<<A3MANUAL>>C|%1|%2",
        _categoria, [getText (_cfgCat >> "displayName")] call _fnc_lim]);

    {
        private _cfgH = _x;
        private _classe = configName _cfgH;
        private _id = format ["%1/%2", _categoria, _classe];

        diag_log text (format ["<<A3MANUAL>>H|%1|%2|%3|%4|%5",
            _id, _categoria, _classe,
            [getText (_cfgH >> "displayName")] call _fnc_lim,
            [getText (_cfgH >> "image")] call _fnc_lim]);

        ["HT", _id, [getText (_cfgH >> "description")] call _fnc_lim] call _fnc_pedacos;

        // `arguments` lista as teclas/acoes citadas no texto (o jogo troca por
        // icone na tela). Guardar cru: quem exibir decide como mostrar.
        private _args = getArray (_cfgH >> "arguments");
        if (count _args > 0) then {
            ["HA", _id, [str _args] call _fnc_lim] call _fnc_pedacos;
        };

        _nTopicos = _nTopicos + 1;
    } forEach ("true" configClasses _cfgCat);
} forEach ("true" configClasses (configFile >> "CfgHints"));

diag_log text (format ["<<A3MANUAL>>PLACAR|%1|%2", _nCats, _nTopicos]);
diag_log text (format ["<<A3MANUAL>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump do manual pronto.\n%1 categorias . %2 topicos\n%3 s\n\nRode: python scripts/arma3/parse-manual.py",
    _nCats, _nTopicos, (diag_tickTime - _t0) toFixed 1];
