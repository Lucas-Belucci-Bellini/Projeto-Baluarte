/*
    DUMP DO CONFIG REAL DO ARMA 3 — armas, carregadores e munição (issue #398).

    POR QUE ASSIM: ler os PBOs do disco não alcança as DLCs (Expeditionary,
    Reaction Forces e Western Sahara vêm em .ebo cifrado) e ainda exigiria
    reconstruir a árvore de herança à mão. Rodando DENTRO do jogo, o config já
    está mesclado e resolvido: vanilla + DLCs + todos os mods do preset, com os
    valores EFETIVOS (inclusive quando um mod sobrescreve outro).

    COMO USAR
      1. Abra o Arma 3 com o preset carregado.
      2. Entre em qualquer missão (ou no editor Eden e aperte Play).
      3. Esc -> DEBUG CONSOLE -> cole este arquivo inteiro -> EXECUTE.
      4. Espere o "DUMP CONCLUIDO" na tela (de alguns segundos a ~1 min).
      5. Feche o jogo e rode:  python scripts/arma3/parse-dump.py

    ONDE SAI: no .rpt da sessão, em
      %LOCALAPPDATA%\Arma 3\Arma3_x64_<data>.rpt
    Cada registro é uma linha marcada com <<A3DUMP>>, delimitada por "|".
    Nada de JSON aqui de propósito: o log do jogo mexe com aspas, e campo
    delimitado por "|" atravessa o .rpt sem escape nenhum.

    REQUER Arma 3 v2.02+ (usa regexReplace). Não precisa de mod nenhum.
*/

private _t0 = diag_tickTime;

/* Limpa um texto pra caber num campo delimitado: sem "|", sem aspas e sem
   quebra de linha. Barra invertida de caminho vira "/" (o lado Python
   normaliza de volta quando precisa procurar dentro do PBO). */
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

/* Número -> texto curto (evita notação científica no log). */
private _fnc_num = { _this toFixed 6 };

diag_log text "<<A3DUMP>>INICIO|v1";

/* ---------------------------------------------------------------
   1) ARMAS — CfgWeapons com scope público e tipo de arma de verdade
      type: 1 = primária · 2 = pistola · 4 = lançador
   --------------------------------------------------------------- */
private _armas = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(getNumber (_x >> 'type')) in [1, 2, 4]}
" configClasses (configFile >> "CfgWeapons");

private _magsUsados = [];
private _nArmas = 0;

{
    private _cfg = _x;

    private _mags = (getArray (_cfg >> "magazines") select { _x isEqualType "" }) apply { toLower _x };
    { if !(_x in _magsUsados) then { _magsUsados pushBack _x } } forEach _mags;

    /* modos de tiro: "this" = o próprio config da arma */
    private _modosTxt = [];
    {
        private _m = _x;
        private _cfgM = if (_m == "this") then { _cfg } else { _cfg >> _m };
        if (_m == "this" || {isClass _cfgM}) then {
            _modosTxt pushBack format ["%1:%2:%3:%4:%5",
                _m call _fnc_lim,
                (getNumber (_cfgM >> "reloadTime")) call _fnc_num,
                (getNumber (_cfgM >> "dispersion")) call _fnc_num,
                getNumber (_cfgM >> "autoFire"),
                getNumber (_cfgM >> "burst")
            ];
        };
    } forEach (getArray (_cfg >> "modes") select { _x isEqualType "" });

    diag_log text (format ["<<A3DUMP>>W|%1|%2|%3|%4|%5|%6|%7|%8|%9|%10|%11|%12",
        configName _cfg,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        getNumber (_cfg >> "type"),
        (configSourceMod _cfg) call _fnc_lim,
        (getText (_cfg >> "picture")) call _fnc_lim,
        (getText (_cfg >> "model")) call _fnc_lim,
        (getNumber (_cfg >> "WeaponSlotsInfo" >> "mass")) call _fnc_num,
        getNumber (_cfg >> "maxZeroing"),
        (getNumber (_cfg >> "initSpeed")) call _fnc_num,
        _mags joinString ";",
        _modosTxt joinString ";",
        (getText (_cfg >> "descriptionShort")) call _fnc_lim
    ]);
    _nArmas = _nArmas + 1;
} forEach _armas;

/* ---------------------------------------------------------------
   2) CARREGADORES — só os que alguma arma acima realmente usa
   --------------------------------------------------------------- */
private _ammosUsados = [];
private _nMags = 0;

{
    private _cfg = configFile >> "CfgMagazines" >> _x;
    if (isClass _cfg) then {
        private _ammo = (getText (_cfg >> "ammo")) call _fnc_lim;
        if (_ammo != "" && {!(toLower _ammo in _ammosUsados)}) then {
            _ammosUsados pushBack toLower _ammo;
        };
        diag_log text (format ["<<A3DUMP>>M|%1|%2|%3|%4|%5|%6|%7",
            configName _cfg,
            (getText (_cfg >> "displayName")) call _fnc_lim,
            _ammo,
            getNumber (_cfg >> "count"),
            (getNumber (_cfg >> "initSpeed")) call _fnc_num,
            (getNumber (_cfg >> "mass")) call _fnc_num,
            (configSourceMod _cfg) call _fnc_lim
        ]);
        _nMags = _nMags + 1;
    };
} forEach _magsUsados;

/* ---------------------------------------------------------------
   3) MUNIÇÃO — o que a calculadora de balística precisa:
      typicalSpeed (v0), airFriction (arrasto) e hit (dano)
   --------------------------------------------------------------- */
private _nAmmo = 0;
{
    private _cfg = configFile >> "CfgAmmo" >> _x;
    if (isClass _cfg) then {
        diag_log text (format ["<<A3DUMP>>A|%1|%2|%3|%4|%5|%6|%7|%8|%9|%10|%11|%12",
            configName _cfg,
            (getNumber (_cfg >> "hit")) call _fnc_num,
            (getNumber (_cfg >> "indirectHit")) call _fnc_num,
            (getNumber (_cfg >> "indirectHitRange")) call _fnc_num,
            (getNumber (_cfg >> "caliber")) call _fnc_num,
            (getNumber (_cfg >> "airFriction")) call _fnc_num,
            (getNumber (_cfg >> "typicalSpeed")) call _fnc_num,
            getNumber (_cfg >> "explosive"),
            getNumber (_cfg >> "deflecting"),
            getNumber (_cfg >> "visibleFire"),
            getNumber (_cfg >> "audibleFire"),
            (getText (_cfg >> "model")) call _fnc_lim
        ]);
        _nAmmo = _nAmmo + 1;
    };
} forEach _ammosUsados;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3DUMP>>FIM|%1|%2|%3|%4", _nArmas, _nMags, _nAmmo, _dt toFixed 1]);

private _msg = format [
    "DUMP CONCLUIDO em %1 s — %2 armas, %3 carregadores, %4 municoes. Feche o jogo e rode: python scripts/arma3/parse-dump.py",
    _dt toFixed 1, _nArmas, _nMags, _nAmmo];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
