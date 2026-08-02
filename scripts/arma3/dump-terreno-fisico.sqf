// Dump das SUPERFÍCIES e do CLIMA — CfgSurfaces, CfgSurfaceCharacters, CfgWeather.
//
// Cole no debug console do Arma 3 com todos os DLCs carregados. Depois:
//     python scripts/arma3/parse-terreno-fisico.py
//
// O que sai: como cada superfície do terreno se COMPORTA — quanto ela freia o
// deslocamento, quanto barulho faz o passo, que poeira levanta, que impacto de
// projétil produz — mais a vegetação que nasce em cima dela e as camadas de
// clima do mundo.
//
// Por que importa aqui: é o dado que liga o terreno à balística e ao movimento,
// os dois assuntos do repo irmão (Vanguard). A base de terrenos que já existe
// descreve a GRADE do mapa; nenhuma descreve o CHÃO.
//
// FORMATO:
//     S |classe|arquivos|aspero|coefVelocidade|somAmbiente|somBater|poeira|impacto|personagem
//     SC|classe|probabilidade|densidade|<objetos em pedaços>
//     W |classe|nome|<parametros em pedaços>
//     PLACAR|superficies|personagens|clima

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

private _fnc_num = { if (isNumber _this) then { str (getNumber _this) } else { "" } };

private _fnc_pedacos = {
    params ["_marca", "_id", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3CHAO>>%1|%2|%3", _marca, _id, _p]);
        _texto = _texto select [700];
    };
};

diag_log text "<<A3CHAO>>INICIO|v1";

private _nS = 0; private _nSC = 0; private _nW = 0;

// ── superfícies ───────────────────────────────────────────────────────────
{
    private _c = _x;
    private _nome = configName _c;
    if (_nome != "Default") then {
        diag_log text (format ["<<A3CHAO>>S|%1|%2|%3|%4|%5|%6|%7|%8|%9",
            _nome,
            [getText (_c >> "files")] call _fnc_lim,
            (_c >> "rough") call _fnc_num,
            (_c >> "maxSpeedCoef") call _fnc_num,       // quanto a superfície freia
            [getText (_c >> "soundEnviron")] call _fnc_lim,
            [getText (_c >> "soundHit")] call _fnc_lim,
            [getText (_c >> "dust")] call _fnc_lim,
            [getText (_c >> "impact")] call _fnc_lim,
            [getText (_c >> "character")] call _fnc_lim]);
        _nS = _nS + 1;
    };
} forEach ("true" configClasses (configFile >> "CfgSurfaces"));

// ── vegetação por superfície ──────────────────────────────────────────────
{
    private _c = _x;
    private _nome = configName _c;
    if (_nome != "Empty") then {
        diag_log text (format ["<<A3CHAO>>SC|%1|%2|%3",
            _nome,
            [str (getArray (_c >> "probability"))] call _fnc_lim,
            (_c >> "density") call _fnc_num]);
        ["SCO", _nome, [str (getArray (_c >> "names"))] call _fnc_lim] call _fnc_pedacos;
        _nSC = _nSC + 1;
    };
} forEach ("true" configClasses (configFile >> "CfgSurfaceCharacters"));

// ── camadas de clima ──────────────────────────────────────────────────────
// CfgWeather é raso e varia entre DLCs; guardamos os parâmetros crus em vez de
// escolher um subconjunto que pode não existir em todo mundo.
{
    private _c = _x;
    private _nome = configName _c;
    private _params = [];
    {
        private _p = _x;
        if (isNumber _p) then { _params pushBack [configName _p, getNumber _p] };
        if (isText _p) then { _params pushBack [configName _p, getText _p] };
    } forEach (configProperties [_c, "true", false]);

    diag_log text (format ["<<A3CHAO>>W|%1|%2", _nome, [getText (_c >> "name")] call _fnc_lim]);
    ["WP", _nome, [str _params] call _fnc_lim] call _fnc_pedacos;
    _nW = _nW + 1;
} forEach ("true" configClasses (configFile >> "CfgWeather"));

diag_log text (format ["<<A3CHAO>>PLACAR|%1|%2|%3", _nS, _nSC, _nW]);
diag_log text (format ["<<A3CHAO>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump de terreno físico pronto.\n%1 superfícies · %2 caracteres · %3 climas\n%4 s\n\nRode: python scripts/arma3/parse-terreno-fisico.py",
    _nS, _nSC, _nW, (diag_tickTime - _t0) toFixed 1];
