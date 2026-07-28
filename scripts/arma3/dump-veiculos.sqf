private _t0 = diag_tickTime;

private _fnc_lim = {
    private _s = _this;
    if (isNil "_s") exitWith { "" };
    if !(_s isEqualType "") exitWith { str _s };
    if (_s select [0, 1] == "$") then { _s = localize _s };
    _s = _s regexReplace ["\\", "/"];
    _s = _s regexReplace ["""", "'"];
    _s = _s regexReplace ["\|", "/"];
    _s = _s regexReplace ["[\r\n\t]+", " "];
    _s
};

private _fnc_sub = {
    private _s = _this call _fnc_lim;
    _s = _s regexReplace ["[;:]", " "];
    _s
};

private _fnc_n = {
    if (isNumber _this) then { (getNumber _this) toFixed 3 } else { "" };
};

private _fnc_pedacos = {
    params ["_marca", "_classe", "_texto"];
    if (_texto == "") exitWith {};
    while { count _texto > 0 } do {
        private _p = _texto select [0, 700];
        diag_log text (format ["<<A3VEIC>>%1|%2|%3", _marca, _classe, _p]);
        _texto = _texto select [700];
    };
};

private _fnc_heranca = {
    private _c = _this;
    private _saida = [];
    private _n = 0;
    while { _n < 14 } do {
        _c = inheritsFrom _c;
        if (isNull _c) exitWith {};
        private _nome = configName _c;
        if (_nome == "") exitWith {};
        _saida pushBack _nome;
        _n = _n + 1;
    };
    _saida joinString ";"
};

private _fnc_lado = {
    private _fac = _this;
    if (_fac == "") exitWith { "" };
    private _e = configFile >> "CfgFactionClasses" >> _fac >> "side";
    if (isNumber _e) then { str (getNumber _e) } else { "" };
};

diag_log text "<<A3VEIC>>INICIO|v1";

private _facs = "true" configClasses (configFile >> "CfgFactionClasses");
private _nFacs = 0;
{
    diag_log text (format ["<<A3VEIC>>F|%1|%2|%3|%4",
        configName _x,
        (getText (_x >> "displayName")) call _fnc_lim,
        (_x >> "side") call _fnc_n,
        (configSourceMod _x) call _fnc_lim
    ]);
    _nFacs = _nFacs + 1;
} forEach _facs;

private _soldados = "
    (getNumber (_x >> 'scope') >= 2) &&
    {(configName _x) isKindOf ['CAManBase', configFile >> 'CfgVehicles']}
" configClasses (configFile >> "CfgVehicles");

private _nSold = 0;
{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _fac = (getText (_cfg >> "faction")) call _fnc_lim;

    diag_log text (format ["<<A3VEIC>>U|%1|%2|%3|%4|%5|%6",
        _classe,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        (configSourceMod _cfg) call _fnc_lim,
        _fac,
        _fac call _fnc_lado,
        (getText (_cfg >> "editorSubcategory")) call _fnc_lim
    ]);

    diag_log text (format ["<<A3VEIC>>UP|%1|%2|%3|%4|%5",
        _classe,
        (getText (_cfg >> "uniformClass")) call _fnc_lim,
        (getText (_cfg >> "backpack")) call _fnc_lim,
        (getText (_cfg >> "icon")) call _fnc_lim,
        (getText (_cfg >> "editorPreview")) call _fnc_lim
    ]);

    ["UW", _classe, ((getArray (_cfg >> "weapons")) joinString ";")] call _fnc_pedacos;
    ["UM", _classe, ((getArray (_cfg >> "magazines")) joinString ";")] call _fnc_pedacos;

    private _link = [];
    {
        if (_x isEqualType "") then { _link pushBack (_x call _fnc_sub) };
    } forEach (getArray (_cfg >> "linkedItems"));
    ["UI", _classe, _link joinString ";"] call _fnc_pedacos;

    _nSold = _nSold + 1;
} forEach _soldados;

private _veiculos = "
    (getNumber (_x >> 'scope') >= 2) &&
    {getNumber (_x >> 'isBackpack') == 0} &&
    {!((configName _x) isKindOf ['CAManBase', configFile >> 'CfgVehicles'])} &&
    {getText (_x >> 'vehicleClass') != ''}
" configClasses (configFile >> "CfgVehicles");

private _nVeic = 0;
{
    private _cfg = _x;
    private _classe = configName _cfg;
    private _fac = (getText (_cfg >> "faction")) call _fnc_lim;

    diag_log text (format ["<<A3VEIC>>V|%1|%2|%3|%4|%5|%6|%7",
        _classe,
        (getText (_cfg >> "displayName")) call _fnc_lim,
        (getText (_cfg >> "vehicleClass")) call _fnc_lim,
        (configSourceMod _cfg) call _fnc_lim,
        _fac,
        _fac call _fnc_lado,
        (getText (_cfg >> "crew")) call _fnc_lim
    ]);

    diag_log text (format ["<<A3VEIC>>VP|%1|%2|%3|%4|%5",
        _classe,
        (getText (_cfg >> "picture")) call _fnc_lim,
        (getText (_cfg >> "editorPreview")) call _fnc_lim,
        (getText (_cfg >> "model")) call _fnc_lim,
        (getText (_cfg >> "icon")) call _fnc_lim
    ]);

    diag_log text (format ["<<A3VEIC>>VC|%1|%2|%3|%4|%5|%6|%7",
        _classe,
        (_cfg >> "maxSpeed") call _fnc_n,
        (_cfg >> "fuelCapacity") call _fnc_n,
        (_cfg >> "transportSoldier") call _fnc_n,
        (_cfg >> "maximumLoad") call _fnc_n,
        (_cfg >> "armor") call _fnc_n,
        (_cfg >> "armorStructural") call _fnc_n
    ]);

    diag_log text (format ["<<A3VEIC>>VD|%1|%2|%3|%4|%5",
        _classe,
        (_cfg >> "cost") call _fnc_n,
        (_cfg >> "mass") call _fnc_n,
        (_cfg >> "enginePower") call _fnc_n,
        (_cfg >> "terrainCoef") call _fnc_n
    ]);

    ["VX", _classe, _cfg call _fnc_heranca] call _fnc_pedacos;

    private _armas = [];
    {
        if (_x isEqualType "") then { _armas pushBack (_x call _fnc_sub) };
    } forEach (getArray (_cfg >> "weapons"));
    {
        {
            if (_x isEqualType "") then { _armas pushBack (_x call _fnc_sub) };
        } forEach (getArray (_x >> "weapons"));
    } forEach ("true" configClasses (_cfg >> "Turrets"));
    ["VW", _classe, _armas joinString ";"] call _fnc_pedacos;

    private _mags = [];
    {
        if (_x isEqualType "") then { _mags pushBack (_x call _fnc_sub) };
    } forEach (getArray (_cfg >> "magazines"));
    ["VM", _classe, _mags joinString ";"] call _fnc_pedacos;

    private _hp = [];
    {
        _hp pushBack format ["%1:%2:%3",
            (configName _x) call _fnc_sub,
            (_x >> "armor") call _fnc_n,
            (_x >> "passThrough") call _fnc_n
        ];
    } forEach ("true" configClasses (_cfg >> "HitPoints"));
    ["VT", _classe, _hp joinString ";"] call _fnc_pedacos;

    _nVeic = _nVeic + 1;
} forEach _veiculos;

private _dt = diag_tickTime - _t0;
diag_log text (format ["<<A3VEIC>>FIM|%1|%2|%3|%4", _nVeic, _nSold, _nFacs, _dt toFixed 1]);

private _msg = format ["DUMP VEICULOS OK em %1 s - %2 veiculos, %3 soldados, %4 faccoes. Rode: python scripts/arma3/parse-veiculos.py",
    _dt toFixed 1, _nVeic, _nSold, _nFacs];
hint _msg;
systemChat _msg;
copyToClipboard _msg;
_msg
