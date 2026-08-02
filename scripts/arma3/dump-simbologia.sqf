// Dump da SIMBOLOGIA - CfgMarkers, CfgMarkerColors, CfgRanks, CfgUnitInsignia.
//
// Cole no debug console do Arma 3 com todos os DLCs carregados. Depois:
//     python scripts/arma3/parse-simbologia.py
//
// Quatro coisas que andam juntas na tela e por isso saem no mesmo dump:
//
//   MARCADORES  - os simbolos de carta do jogo, que seguem a APP-6 da OTAN
//                 (infantaria, blindado, artilharia, posto de comando...). E o
//                 elo que faltava entre o Centro Militar, que fala de
//                 organizacao militar em texto, e um simbolo de verdade.
//   CORES       - a paleta oficial de lado (BLUFOR azul, OPFOR vermelho,
//                 Independente verde, Civil roxo), com o RGBA exato.
//   PATENTES    - CfgRanks: a hierarquia do soldado ao coronel, com a textura
//                 da divisa.
//   INSIGNIAS   - CfgUnitInsignia: os brasoes de unidade, com autor.
//
// FORMATO:
//     M |classe|nome|icone|cor|tamanho|escopo|sombra
//     MC|classe|nome|r|g|b|a
//     R |classe|nome|textura
//     I |classe|nome|textura|autor
//     PLACAR|marcadores|cores|patentes|insignias

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

// Ausente tem de virar campo VAZIO, nao zero: zero e um valor legitimo aqui
// (tamanho 0, escopo 0) e confundir os dois mente na tabela.
private _fnc_num = { if (isNumber _this) then { str (getNumber _this) } else { "" } };

diag_log text "<<A3SIMB>>INICIO|v1";

private _nM = 0; private _nC = 0; private _nR = 0; private _nI = 0;

// -- marcadores ------------------------------------------------------------
{
    private _c = _x;
    diag_log text (format ["<<A3SIMB>>M|%1|%2|%3|%4|%5|%6|%7",
        configName _c,
        [getText (_c >> "name")] call _fnc_lim,
        [getText (_c >> "icon")] call _fnc_lim,
        [getText (_c >> "color")] call _fnc_lim,
        (_c >> "size") call _fnc_num,
        (_c >> "scope") call _fnc_num,
        (_c >> "shadow") call _fnc_num]);
    _nM = _nM + 1;
} forEach ("true" configClasses (configFile >> "CfgMarkers"));

// -- cores de marcador -----------------------------------------------------
{
    private _c = _x;
    private _rgba = getArray (_c >> "color");
    // A cor pode vir como numero ou como expressao de cor do jogo; so os
    // numericos viram RGBA. O resto sai vazio em vez de virar 0.
    private _v = [];
    { _v pushBack (if (_x isEqualType 0) then { str _x } else { "" }) } forEach _rgba;
    while { count _v < 4 } do { _v pushBack "" };

    diag_log text (format ["<<A3SIMB>>MC|%1|%2|%3|%4|%5|%6",
        configName _c,
        [getText (_c >> "name")] call _fnc_lim,
        _v select 0, _v select 1, _v select 2, _v select 3]);
    _nC = _nC + 1;
} forEach ("true" configClasses (configFile >> "CfgMarkerColors"));

// -- patentes --------------------------------------------------------------
{
    private _c = _x;
    diag_log text (format ["<<A3SIMB>>R|%1|%2|%3",
        configName _c,
        [getText (_c >> "displayName")] call _fnc_lim,
        [getText (_c >> "texture")] call _fnc_lim]);
    _nR = _nR + 1;
} forEach ("true" configClasses (configFile >> "CfgRanks"));

// -- insignias de unidade --------------------------------------------------
{
    private _c = _x;
    diag_log text (format ["<<A3SIMB>>I|%1|%2|%3|%4",
        configName _c,
        [getText (_c >> "displayName")] call _fnc_lim,
        [getText (_c >> "texture")] call _fnc_lim,
        [getText (_c >> "author")] call _fnc_lim]);
    _nI = _nI + 1;
} forEach ("true" configClasses (configFile >> "CfgUnitInsignia"));

diag_log text (format ["<<A3SIMB>>PLACAR|%1|%2|%3|%4", _nM, _nC, _nR, _nI]);
diag_log text (format ["<<A3SIMB>>FIM|%1", (diag_tickTime - _t0) toFixed 2]);

hint format ["Dump de simbologia pronto.\n%1 marcadores . %2 cores . %3 patentes . %4 insignias\n%5 s\n\nRode: python scripts/arma3/parse-simbologia.py",
    _nM, _nC, _nR, _nI, (diag_tickTime - _t0) toFixed 1];
